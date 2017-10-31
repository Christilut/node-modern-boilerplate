import Handlebars from 'handlebars'
import * as mailcomposer from 'mailcomposer'
import * as fs from 'fs-extra'
import * as path from 'path'
import * as Joi from 'joi'
import env from 'config/env'
import logger from 'config/logger'
import mailgun from 'config/mailgun'

export enum EMAIL_TEMPLATES {
  Action = 'action',
  Alert = 'alert',
  Info = 'info',
  Welcome = 'welcome'
}

async function _generateMail(templateName: EMAIL_TEMPLATES, data: Object) {
  let schema

  if (templateName === EMAIL_TEMPLATES.Action) {
    schema = Joi.object().keys({
      title: Joi.string().required(),
      message: Joi.string().required(),
      buttonText: Joi.string().required(),
      buttonUrl: Joi.string().uri().required()
    })
  } else if (templateName === EMAIL_TEMPLATES.Alert) {
    schema = Joi.object().keys({
      title: Joi.string().required(),
      lead: Joi.string().required(),
      warningText: Joi.string().required(),
      message: Joi.string().required(),
      buttonText: Joi.string().optional(),
      buttonUrl: Joi.string().uri().optional()
    })
  } else if (templateName === EMAIL_TEMPLATES.Info) {
    schema = Joi.object().keys({
      title: Joi.string().required(),
      lead: Joi.string().required(),
      message: Joi.string().required(),
      buttonText: Joi.string().optional(),
      buttonUrl: Joi.string().uri().optional()
    })
  } else if (templateName === EMAIL_TEMPLATES.Welcome) {
    schema = Joi.object().keys({
      name: Joi.string().required(),
      domain: Joi.string().uri().required()
    })
  } else {
    throw new Error('nyi')
  }

  const result = Joi.validate(data, schema)

  if (result.error) throw new Error(result.error.message)

  const rawTemplate = Handlebars.compile((await fs.readFile(path.join(__dirname, '..', '..', 'email-templates', templateName + '.handlebars'))).toString())

  return rawTemplate(data)
}

export async function sendMail(to: string, subject: string, text: string, templateName: EMAIL_TEMPLATES, templateData: Object) {
  if (!env.EMAIL_FROM_ADDRESS) {
    throw new Error('No EMAIL_FROM_ADDRESS set, not sending mail')
  }

  if (!mailgun && env.NODE_ENV !== env.Environments.Test) {
    throw new Error('Mailgun not loaded, did you provide credentials?')
  }

  if (env.NODE_ENV === env.Environments.Development) { // Never send mails to real emails in development
    to = env.EMAIL_FROM_ADDRESS
  }

  try {
    const rawMessage = mailcomposer({
      from: env.EMAIL_FROM_ADDRESS,
      to,
      subject,
      text, // text that is shown incase client doesnt support HTML
      html: await _generateMail(templateName, templateData)
    })

    rawMessage.build(async function (err, builtMessage) {
      if (err) throw new Error(err)

      const mail = {
        to,
        message: builtMessage.toString('ascii')
      }

      if (env.NODE_ENV !== env.Environments.Test) {
        const res = await mailgun.messages().sendMime(mail)

        logger.info('Mail sent', res)
      } else {
        console.log('TEST: not actually sending mail')
      }
    })
  } catch (error) {
    logger.error('Failed building or sending mail', error)
  }
}

export async function sendDevMail(subject: string, text: string) {
  await sendMail(
    env.EMAIL_FROM_ADDRESS,
    subject,
    text,
    EMAIL_TEMPLATES.Info,
    {
      title: subject,
      lead: 'Automated message from API server',
      message: text
    }
  )
}
