import env from 'config/env'
import logger from 'config/logger'
import APIError from 'server/helpers/APIError'
import { ExpressHandler } from 'apollo-server-express'
import { schema, adminSchema } from 'server/models'
import { graphqlExpress } from 'apollo-server-express'
import * as bodyParser from 'body-parser'

export const graphQlRoute = graphqlExpress(req => ({
  schema,
  context: {
    user: req.user
  },
  formatError: (err) => {
    if (env.NODE_ENV === 'production') {
      logger.warn('GraphQL query failed', err)
    } else {
      console.warn(err.stack)
    }

    if (err.originalError instanceof APIError) {
      if (env.NODE_ENV === 'production' && !err.originalError.isPublic) {
        err.message = 'Internal server error'
      }
    }

    return err
  }
}))

export const graphQlAdminRoute = graphqlExpress(req => ({
  schema: adminSchema,
  context: {
    user: req.user
  },
  formatError: (err) => {
    if (env.NODE_ENV === 'production') {
      logger.warn('Admin GraphQL query failed', err)
    } else {
      console.warn(err.stack)
    }

    if (err.originalError instanceof APIError) {
      if (env.NODE_ENV === 'production' && !err.originalError.isPublic) {
        err.message = 'Internal server error'
      }
    }

    return err
  }
}))
