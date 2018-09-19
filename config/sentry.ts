import env from 'config/env'
import * as Raven from 'raven'
import * as httpStatus from 'http-status'

function sentryFilter(data) {
  const statusCode = data.res.statusCode

  // Filter auth errors
  if (statusCode === httpStatus.UNAUTHORIZED) return false

  // Filter users trying things they shouldnt
  if (statusCode === httpStatus.FORBIDDEN) return false

  return true
}

if (env.SENTRY_URL) {
  Raven.config(env.SENTRY_URL, {
    environment: env.NODE_ENV,
    shouldSendCallback: sentryFilter
  }).install()

  console.log('Sentry: Loaded')
} else {
  console.log('Sentry: tMissing Sentry credentials, not loading')
}
