import env from 'config/env'
import logger from 'config/logger'
import { APIError, ExtendableError } from 'server/helpers/error'
import { ExpressHandler, graphqlExpress } from 'apollo-server-express'
import { schema } from './merge'
import * as Raven from 'raven'

function formatError(err) {
  logger.warn('GraphQL query failed', err)

  if (err.originalError instanceof ExtendableError && (err.originalError as ExtendableError).reportToSentry === false) {
    // dont send to sentry
  } else {
    if (env.NODE_ENV === env.Environments.Production) {
      Raven.captureException(err) // TODO add logged in user info here
    }
  }

  if (err.originalError instanceof APIError) {
    if (env.NODE_ENV === env.Environments.Production && !err.originalError.isPublic) {
      err.message = 'Internal server error'
    }
  }

  if (env.NODE_ENV === env.Environments.Test) { // TODO this might spam during tests when errors are expected, so might need to revise this
    console.log('(test) ' + err.message)
  }

  return err
}

export const graphQlRoute = graphqlExpress(req => ({
  schema,
  context: {
    user: (req as any).user
  },
  formatError
}))

if (env.NODE_ENV !== env.Environments.Test) {
  console.log('GraphQL: Loaded')
}
