import env from 'config/env'
import logger from 'config/logger'
import APIError from 'server/helpers/APIError'
import { ExpressHandler } from 'apollo-server-express'
import GraphqlSchema from 'server/models'
import { graphqlExpress, graphiqlExpress } from 'apollo-server-express'
import * as bodyParser from 'body-parser'

export const graphiQL = graphiqlExpress({ endpointURL: '/graphql' })

export const graphQlRoute = graphqlExpress(req => ({
  schema: GraphqlSchema,
  context: {
    user: {
      email: req.user.email
    }
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
