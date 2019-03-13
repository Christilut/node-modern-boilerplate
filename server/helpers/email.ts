import * as Handlebars from 'handlebars'
import * as fs from 'fs-extra'
import * as path from 'path'
import * as Joi from 'joi'
import env from 'config/env'
import logger from 'config/logger'
import * as nodemailer from 'nodemailer'
import * as mailgunTransport from 'nodemailer-mailgun-transport'

export enum EMAIL_TEMPLATES {
  Action = 'action',
  Alert = 'alert',
  Info = 'info',
  Welcome = 'welcome',
  Aanvraag = 'aanvraag'
}

export interface ISendMail {
  to: string,
  bcc?: string[],
  from: string,
  subject: string,
  text: string,
  templateName: EMAIL_TEMPLATES,
  templateData: Object,
  attachments?: IMailAttachment[]
}

interface IMailParameters {
  to: string,
  cc?: string[],
  bcc?: string[],
  from: string,
  subject: string,
  text: string,
  html: string,
  attachments?: IMailAttachment[]
}

export interface IMailAttachment {
  filename?: string,
  content?: Buffer,
  path?: string,
  cid?: string
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
      lead: Joi.string().optional(),
      warningText: Joi.string().required(),
      message: Joi.string().required(),
      buttonText: Joi.string().optional(),
      buttonUrl: Joi.string().uri().optional()
    })
  } else if (templateName === EMAIL_TEMPLATES.Info) {
    schema = Joi.object().keys({
      title: Joi.string().required(),
      lead: Joi.string().optional(),
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

export async function sendMail(args: ISendMail) {
  if (env.NODE_ENV === env.Environments.Test) return

  if (!env.EMAIL_FROM_ADDRESS) {
    throw new Error('No EMAIL_FROM_ADDRESS set, not sending mail')
  }

  if (env.NODE_ENV === env.Environments.Development) { // Never send mails to real emails in development
    if (!env.EMAIL_DEV_ADDRESS) throw new Error('no dev email address set')

    args.to = env.EMAIL_DEV_ADDRESS
  }

  const mailParameters: IMailParameters = {
    from: args.from,
    to: args.to,
    subject: args.subject,
    text: args.text,
    html: await _generateMail(args.templateName, args.templateData)
  }

  if (args.attachments) {
    mailParameters.attachments = args.attachments
  }

  const mailgunAuth = {
    auth: {
      api_key: env.MAILGUN_API_KEY,
      domain: env.MAILGUN_DOMAIN
    }
  }

  if (env.NODE_ENV !== env.Environments.Test) {
    const mailer = nodemailer.createTransport(mailgunTransport(mailgunAuth))

    try {
      const response = await mailer.sendMail(mailParameters)

      logger.info('Mail sent', response)

      return response
    } catch (error) {
      logger.error('Transport failed', error.message)

      throw new Error('Mailer responded with: ' + error.message)
    }
  } else {
    // console.log('TEST: not actually sending mail')
  }
}

export async function sendDevMail(subject: string, text: string) {
  await sendMail({
    to: env.EMAIL_FROM_ADDRESS,
    from: env.EMAIL_FROM_ADDRESS,
    subject,
    text,
    templateName: EMAIL_TEMPLATES.Info,
    templateData: {
      title: subject,
      lead: 'Automated message from API server',
      message: text
    }
  })
}
