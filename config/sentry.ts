import env from 'config/env'
import logger from 'config/logger'
import * as Sentry from '@sentry/node'

if (env.SENTRY_URL) {
  Sentry.init({
    dsn: env.SENTRY_URL,
    environment: env.NODE_ENV,
    beforeSend(event) {
      let message: string = event.message
      let stacktrace: string
      let extra: any = event.extra

      if (event.exception) {
        message = event.exception.values.map(x => x.value).join(',')

        stacktrace = event.exception.values.map(x => x.stacktrace.frames.map(y => y.context_line).join('\n')).join('\n\n')

        if (!extra) extra = {}
        extra.stacktrace = stacktrace
      }

      logger.error('Sentry error: ' + message, {
        message,
        extra
      })

      return event
    }
  })

  console.log('Sentry:\t\t\tLoaded')
} else {
  console.log('Sentry:\t\t\tMissing Sentry credentials, not loading')
}

export function message(message: string, extra: object) {
  Sentry.withScope(scope => {
    for (const key in extra) {
      scope.setExtra(key, extra[key])
    }

    scope.setLevel(Sentry.Severity.Info)
    Sentry.captureMessage(message)
  })
}

export function exception(err: Error, extra: object) {
  Sentry.withScope(scope => {
    for (const key in extra) {
      scope.setExtra(key, extra[key])
    }

    scope.setLevel(Sentry.Severity.Error)
    Sentry.captureException(err)
  })
}
