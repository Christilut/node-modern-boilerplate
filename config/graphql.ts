import env from 'config/env'
import logger from 'config/logger'
import { APIError, ValidationError, ExtendableError } from 'server/helpers/APIError'
import { ExpressHandler } from 'apollo-server-express'
import { schema, adminSchema } from 'server/models'
import { graphqlExpress } from 'apollo-server-express'
import * as bodyParser from 'body-parser'
import * as Raven from 'raven'

function formatError(err, admin: boolean = false) {
  logger.warn(admin ? 'Admin ' : '' + 'GraphQL query failed', err)

  if (err.originalError instanceof ExtendableError && (err.originalError as ExtendableError).reportToSentry === false) {
      // dont send to sentry
  } else {
    Raven.captureException(err) // TODO add logged in user info here
  }

  if (err.originalError instanceof APIError) {
    if (env.NODE_ENV === 'production' && !err.originalError.isPublic) {
      err.message = 'Internal server error'
    }
  }

  return err
}

export const graphQlRoute = graphqlExpress(req => ({
  schema,
  context: {
    user: req.user
  },
  formatError
}))

export const graphQlAdminRoute = graphqlExpress(req => ({
  schema: adminSchema,
  context: {
    user: req.user
  },
  formatError: (err) => formatError(err, true)
}))
