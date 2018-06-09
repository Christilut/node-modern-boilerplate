import env from 'config/env'
import * as Raven from 'raven'

if (env.SENTRY_URL) {
  Raven.config(env.SENTRY_URL, {
    environment: env.NODE_ENV
  }).install()

  console.log('Sentry: Loaded')
} else {
  console.log('Sentry: Missing Sentry credentials, not loading')
}
