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
import APIError from 'server/helpers/APIError'
import { graphiqlExpress } from 'apollo-server-express'
import { checkAuthentication, checkAdminRole } from 'server/controllers/auth.controller'
const router = require('express-promise-router')()

const app = express()

if (env.NODE_ENV === 'development') {
  app.use(Morgan('dev'))
}

// parse body params and attache them to req.body
app.use(bodyParser.json({ limit: '50mb' }))
app.use(bodyParser.urlencoded({ extended: true }))

app.use(compress())

// app.use(passport.initialize())

app.enable('trust proxy') // only if you're behind a reverse proxy (Heroku, Bluemix, AWS if you use an ELB, custom Nginx setup, etc)

// secure apps by setting various HTTP headers
app.use(helmet())

// enable CORS - Cross Origin Resource Sharing
if (env.NODE_ENV === 'production') {
  app.use(cors())
  // app.use(cors({
  //   origin: [], // TODO add origins for production
  //   optionsSuccessStatus: 200
  // }))
} else {
  app.use(cors())
}

// Public routes for login and registration
import publicRoutes from 'server/public_routes'
app.use('/', publicRoutes)

// Private GraphQL routes, require authentication
import { graphQlRoute, graphQlAdminRoute } from 'config/graphql'

if (env.NODE_ENV === 'development') {
  app.use('/graphiql', graphiqlExpress({ endpointURL: '/graphql' }))
  app.use('/admin-graphiql', graphiqlExpress({ endpointURL: '/admin-graphql' }))
}

router.use('/graphql', bodyParser.json(), checkAuthentication, graphQlRoute)
router.use('/admin-graphql', bodyParser.json(), checkAuthentication, checkAdminRole, graphQlAdminRoute)
app.use('/', router)

// enable detailed API logging
if (env.NODE_ENV !== 'test') {
  expressWinston.requestWhitelist.push('body')
  expressWinston.responseWhitelist.push('body')
  app.use(expressWinston.logger({
    winstonInstance: logger,
    meta: true, // optional: log meta data about request (defaults to true)
    msg: 'HTTP {{req.method}} {{req.url}} {{res.statusCode}} {{res.responseTime}}ms',
    colorStatus: true // Color the status code (default green, 3XX cyan, 4XX yellow, 5XX red).
  }))
}

// if error is not an instanceOf APIError, convert it.
app.use((err, req, res, next) => {
  if (!(err instanceof APIError)) {
    const apiError = new APIError(err.message, err.status, err.isPublic)

    return next(apiError)
  }
  return next(err)
})

// catch 404 and forward to error handler
app.use((req, res, next) => {
  if (req.url === '/favicon.ico') {
    return res.sendStatus(httpStatus.NOT_FOUND)
  }

  const err = new APIError('API not found', httpStatus.NOT_FOUND)
  return next(err)
})

// error handler, send stacktrace only during development
app.use((err, req, res, next) => { // eslint-disable-line no-unused-vars
  //   if (env.NODE_ENV === 'development') {
  //     // console.log(err.stack)
  //   }

  //   // console.log(err)
  // console.log(req)

  // return res.sendStatus(httpStatus.OK)

  //   if (env.NODE_ENV !== 'test') {
  //     // if (err.status === httpStatus.CONFLICT || // username taken, website name taken, etc
  //     //   err.status === httpStatus.UNAUTHORIZED || // bad login
  //     //   err.status === httpStatus.NOT_FOUND || // user not found, website not found, etc
  //     //   err.status === httpStatus.NOT_ACCEPTABLE || // used for when social login has same email as existing account or bad google translate action
  //     //   err.status === httpStatus.EXPECTATION_FAILED) { // 409 is not an error
  //     //   logger.warn('Handled error', {
  //     //     err,
  //     //     request: {
  //     //       url: req.url,
  //     //       params: req.params,
  //     //       query: req.query,
  //     //       method: req.method,
  //     //       body: req.body
  //     //     }
  //     //   })
  //     // } else {
  //     const headersWithoutAuth = req.headers
  //     delete headersWithoutAuth.authorization

  //     logger.error('Unhandled exception occurred', {
  //       err,
  //       stack: err.stack,
  //       request: {
  //         url: req.url,
  //         params: req.params,
  //         query: req.query,
  //         method: req.method,
  //         headers: headersWithoutAuth,
  //         body: req.body
  //       }
  //     })
  //     // }
  //   }

  if (env.NODE_ENV === 'development') {
    res.status(httpStatus.BAD_REQUEST).json({
      message: err.isPublic ? err.message : httpStatus[err.status],
      stack: err.stack
    })
  } else {
    res.status(httpStatus.BAD_REQUEST).json({
      message: err.isPublic ? err.message : httpStatus[err.status]
    })
  }
})

export default app
