import env from 'config/env'
import logger from 'config/logger'
import * as httpStatus from 'http-status'
import * as express from 'express'
import * as Morgan from 'morgan'
import * as bodyParser from 'body-parser'
import * as compress from 'compression'
import * as cors from 'cors'
import * as expressWinston from 'express-winston'
import * as helmet from 'helmet'
import * as Raven from 'raven'
import { APIError } from 'server/helpers/error'
import { graphiqlExpress } from 'apollo-server-express'
import { checkAuthentication } from 'server/controllers/auth.controller'
import { Express } from 'express-serve-static-core'
import * as getPort from 'get-port'

import publicRoutes from 'server/public_routes'
import { graphQlRoute } from 'config/graphql'

let app: Express

(async () => { // tslint:disable-line
  app = express()

  const router = require('express-promise-router')()

  // Parse body params and set them to req.body
  app.use(bodyParser.json({ limit: '50mb' }))
  app.use(bodyParser.urlencoded({ extended: true }))

  app.use(compress()) // Enable compression
  app.enable('trust proxy') // Needed if you're behind a reverse proxy (Heroku, Bluemix, AWS if you use an ELB, custom Nginx setup, etc)
  app.use(helmet()) // Secure apps by setting various HTTP headers

  // Enable CORS - Cross Origin Resource Sharing
  if (env.NODE_ENV === env.Environments.Production) {
    app.use(cors())
    // app.use(cors({
    //   origin: [], // TODO add origins for production
    //   optionsSuccessStatus: 200
    // }))

    // Enable Forest Admin (must be done before express error handlers)
  } else {
    app.use(cors())
  }

  // Load Forest Admin (must be after CORS)
  require('config/forestadmin')(app)

  // Enable detailed API logging
  if (env.NODE_ENV !== env.Environments.Test) {
    expressWinston.requestWhitelist.push('body')
    expressWinston.responseWhitelist.push('body')
    app.use(expressWinston.logger({
      winstonInstance: logger,
      meta: true, // optional: log meta data about request (defaults to true)
      msg: 'HTTP {{req.method}} {{req.url}} {{res.statusCode}} {{res.responseTime}}ms',
      colorStatus: true, // Color the status code (default green, 3XX cyan, 4XX yellow, 5XX red).
      skip: (req, res) => {
        // Filter logging errors here that are not really errors. This also prevents them from showing up in Sentry.

        // Filter 404: bots cause these
        if (env.NODE_ENV === env.Environments.Production) {
          return (
            res.statusCode === httpStatus.NOT_FOUND
            ||
            (res.statusCode === httpStatus.OK && req.url.includes('/misc/health-check'))
          )
        }

        return false
      }
    }))
  }

  // Public routes for login and registration
  app.use('/', publicRoutes)

  router.use('/graphql', bodyParser.json(), checkAuthentication, graphQlRoute)
  app.use('/', router)

  // Error handler, send stacktrace only during development
  app.use((err, req, res, next) => { // eslint-disable-line no-unused-vars
    if (env.NODE_ENV !== env.Environments.Test) {
      if (err instanceof APIError || err.name === 'APIError') {
        logger.warn('Handled API error', {
          err,
          headers: req.headers
        })
      } else {
        logger.error('Unhandled exception occurred: ' + err.message, {
          err,
          stack: err.stack,
          headers: req.headers
        })

        if (!err.skipReportToSentry) {
          Raven.captureException(err, {
            req,
            res,
            extra: {
              body: req.body
            }
          } as Raven.CaptureOptions)
        }
      }
    }

    if (env.NODE_ENV === env.Environments.Test) {
      if (err.status === httpStatus.INTERNAL_SERVER_ERROR) { // TODO needed?
        console.log('Internal Server Error:', err.message)
      }
    }

    // Determines what to return to user. Add error stack in development. Only add error message if it is set as public.
    if (env.NODE_ENV === env.Environments.Production) {
      res.status(err.status).json({
        message: err.isPublic ? err.message : httpStatus[err.status]
      })
    } else {
      res.status(err.status || httpStatus.INTERNAL_SERVER_ERROR).json({
        message: err.message,
        stack: err.stack
      })
    }
  })

  const port = env.NODE_ENV === env.Environments.Test ? await getPort() : env.PORT || 443

  app.listen(port, () => {
    logger.info(`Server started on port ${port} (${env.NODE_ENV})`)
  })

  if (env.NODE_ENV !== env.Environments.Test) {
    console.log('Express:\t\tLoaded')
  }
})()

export default app
