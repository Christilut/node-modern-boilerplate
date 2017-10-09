// require('app-module-path').addPath(__dirname)

global.httpStatus = import('http-status')
global.config = import('./config/config')
global.logger = import('./config/logger')

import mongoose from 'mongoose'
import util from 'util'
import Joi from 'joi'

Joi.objectId = require('joi-objectid')(Joi)

import app from './config/express'

const debug = require('debug')('express-mongoose-es6-rest-api:index')

// // make bluebird default Promise
// Promise = require('bluebird') // eslint-disable-line no-global-assign

// // plugin bluebird promise in mongoose
// mongoose.Promise = Promise

// connect to mongo db
if (global.config.NODE_ENV === 'test') {
  const Mockgoose = require('mockgoose').Mockgoose
  const mockgoose = new Mockgoose(mongoose)

  // mockgoose.helper.setDbVersion('3.4.3') // Set this (to newest mongo version) if tests keep re-downloading prebuilt mongo

  mockgoose.prepareStorage().then(function () {
    mongoose.connect('mongodb://example.com/boilerplate-test')
  })
} else {
  mongoose.connect(global.config.MONGO_HOST, {
    server: {
      socketOptions: {
        keepAlive: 1
      }
    }
  })
}

mongoose.connection.on('error', () => {
  throw new Error(`unable to connect to database`)
})

// print mongoose logs in dev env
if (global.config.MONGOOSE_DEBUG) {
  mongoose.set('debug', (collectionName, method, query, doc) => {
    debug(`${collectionName}.${method}`, util.inspect(query, false, 20), doc)
  })
}

// module.parent check is required to support mocha watch
// src: https://github.com/mochajs/mocha/issues/1912
if (!module.parent) {
  // listen on port config.PORT
  app.listen(global.config.PORT, () => {
    global.logger.info(`server started on port ${global.config.PORT} (${global.config.NODE_ENV})`)
  })
}
