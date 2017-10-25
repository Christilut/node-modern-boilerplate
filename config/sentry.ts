import env from 'config/env'
import * as Raven from 'raven'

if (env.SENTRY_URL) {
  Raven.config(env.SENTRY_URL, {
    environment: env.NODE_ENV
  }).install()

  console.log('Loaded Sentry')
} else {
  console.log('Missing Sentry credentials, not loading')
}
