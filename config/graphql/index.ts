import env from 'config/env'
import logger from 'config/logger'
import { APIError, ExtendableError } from 'server/helpers/error'
import { ExpressHandler, graphqlExpress } from 'apollo-server-express'
import { schema } from './merge'
import * as Raven from 'raven'
import * as JWT from 'jsonwebtoken'
import { IJsonWebTokenContents } from 'server/controllers/auth.controller'

function formatError(err, req) {
  logger.warn('GraphQL query failed', err)

  if (err.originalError instanceof ExtendableError && (err.originalError as ExtendableError).reportToSentry === false) {
    // dont send to sentry
  } else {
    if (env.NODE_ENV === env.Environments.Production) {
      let userId = 'no auth header'

      if (req.headers.authorization) {
        try {
          const decodedToken = JWT.decode(req.headers.authorization.replace('Bearer ', '')) as IJsonWebTokenContents

          userId = decodedToken.id
        } catch (error) {
          // just ignore if it errors, probably it is some kind of malformed token
        }
      }

      Raven.captureException(err, {
        extra: {
          userId
        }
      })
    }
  }

  if (err.originalError instanceof APIError) {
    if (env.NODE_ENV === env.Environments.Production && !err.originalError.isPublic) {
      err.message = 'Internal server error'
    }
  }

  // if (env.NODE_ENV === env.Environments.Test) {
  //   console.log('(test) ' + err.message)
  // }

  return err
}

export const graphQlRoute = graphqlExpress(req => ({
  schema,
  context: {
    user: (req as any).user
  },
  formatError: (err) => formatError(err, req)
}))

if (env.NODE_ENV !== env.Environments.Test) {
  console.log('GraphQL: Loaded')
}
