import env from 'config/env'
import * as Raven from 'raven'

if (env.SENTRY_URL) {
  if (env.NODE_ENV === env.Environments.Production) {
    Raven.config(env.SENTRY_URL, {
      environment: env.NODE_ENV
    }).install()

    console.log('Sentry: Loaded')
  } else {
    console.log('Sentry: Not loading outside production environment')
  }
} else {
  console.log('Sentry: Missing Sentry credentials, not loading')
}
