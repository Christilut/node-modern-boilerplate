const Handlebars = require('handlebars')
const mailcomposer = require('mailcomposer')
const fs = require('fs-extra')
const path = require('path')
const Joi = require('joi')

const DEV_EMAIL = 'todo'

const mailgun = require('mailgun-js')({
  apiKey: config.MAILGUN_API_KEY,
  domain: config.MAILGUN_DOMAIN
})

async function _generateMail (templateName, data) {
  if (!['action', 'alert', 'info', 'billing', 'welcome'].includes(templateName)) throw new Error('invalid email template name')

  let schema

  if (templateName === 'action') {
    schema = Joi.object().keys({
      title: Joi.string().required(),
      message: Joi.string().required(),
      buttonText: Joi.string().required(),
      buttonUrl: Joi.string().uri().required()
    })
  } else if (templateName === 'alert') {
    schema = Joi.object().keys({
      title: Joi.string().required(),
      lead: Joi.string().required(),
      warningText: Joi.string().required(),
      message: Joi.string().required(),
      buttonText: Joi.string().optional(),
      buttonUrl: Joi.string().uri().optional()
    })
  } else if (templateName === 'info') {
    schema = Joi.object().keys({
      title: Joi.string().required(),
      lead: Joi.string().required(),
      message: Joi.string().required(),
      buttonText: Joi.string().optional(),
      buttonUrl: Joi.string().uri().optional()
    })
  } else if (templateName === 'welcome') {
    schema = Joi.object().keys({
      name: Joi.string().required(),
      domain: Joi.string().uri().required()
    })
  } else {
    throw new Error('nyi')
  }

  const result = Joi.validate(data, schema)

  if (result.error) throw new Error(result.error)

  const rawTemplate = Handlebars.compile((await fs.readFile(path.join(__dirname, '..', '..', 'email-templates', templateName + '.handlebars'))).toString())

  return rawTemplate(data)
}

async function sendMail ({ to, subject, text, templateName, templateData }) {
  if (config.NODE_ENV === 'development') {
    to = DEV_EMAIL
    throw new Error('fill in development email')
  }

  try {
    /* eslint-disable no-unreachable */
    throw new Error('fill in FROM email address')
    const rawMessage = mailcomposer({
      from: 'todo', // TODO fill in from email
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

      if (config.NODE_ENV === 'test') {
        console.log('TEST: not actually sending mail')
      } else {
        const res = await mailgun.messages().sendMime(mail)

        logger.info('Mail sent', res)
      }
    })
  } catch (error) {
    logger.error('Failed building or sending mail', error)
  }
}

async function sendDevMail (subject, text) {
  await sendMail({
    to: DEV_EMAIL,
    subject,
    text,
    templateName: 'info',
    templateData: {
      title: subject,
      lead: 'Automated message from API server',
      message: text
    }
  })
}

module.exports = {
  sendMail,
  sendDevMail
}
