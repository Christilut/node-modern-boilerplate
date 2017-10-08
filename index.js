require('app-module-path').addPath(__dirname)

global.httpStatus = require('http-status')
global.config = require('./config/config')

const mongoose = require('mongoose')
const util = require('util')

const Joi = require('joi')
Joi.objectId = require('joi-objectid')(Joi)

// config should be imported before importing any other file
const app = require('./config/express')

const debug = require('debug')('express-mongoose-es6-rest-api:index')

// make bluebird default Promise
Promise = require('bluebird') // eslint-disable-line no-global-assign

// plugin bluebird promise in mongoose
mongoose.Promise = Promise

// connect to mongo db
if (config.NODE_ENV === 'test') {
  const Mockgoose = require('mockgoose').Mockgoose
  const mockgoose = new Mockgoose(mongoose)

  mockgoose.helper.setDbVersion('3.4.3') // TODO newest version fails on tests

  mockgoose.prepareStorage().then(function () {
    mongoose.connect('mongodb://example.com/boilerplate-test')
  })
} else {
  mongoose.connect(config.MONGO_HOST, { server: { socketOptions: { keepAlive: 1 } } })
}

mongoose.connection.on('error', () => {
  throw new Error(`unable to connect to database: ${config.db}`)
})

// print mongoose logs in dev env
if (config.MONGOOSE_DEBUG) {
  mongoose.set('debug', (collectionName, method, query, doc) => {
    debug(`${collectionName}.${method}`, util.inspect(query, false, 20), doc)
  })
}

// module.parent check is required to support mocha watch
// src: https://github.com/mochajs/mocha/issues/1912
if (!module.parent) {
  // listen on port config.PORT
  app.listen(config.PORT, () => {
    logger.info(`server started on port ${config.PORT} (${config.NODE_ENV})`)
  })
}

app.enable('trust proxy') // only if you're behind a reverse proxy (Heroku, Bluemix, AWS if you use an ELB, custom Nginx setup, etc)

module.exports = app
