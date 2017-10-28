import env from 'config/env'
import * as Mailgun from 'mailgun-js'

let mailgun
if (!module.parent.parent) { // Only load if called from startup index file
  if (env.MAILGUN_API_KEY && env.MAILGUN_DOMAIN) {
    mailgun = Mailgun({
      apiKey: env.MAILGUN_API_KEY,
      domain: env.MAILGUN_DOMAIN
    })

    console.log('Mailgun: Loaded')
  } else {
    console.log('Mailgun: Missing crendetials, not loading')
  }
}

export default mailgun
