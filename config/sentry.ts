import env from 'config/env'
import * as Raven from 'raven'

Raven.config(env.SENTRY_URL, {
  environment: env.NODE_ENV
}).install()
