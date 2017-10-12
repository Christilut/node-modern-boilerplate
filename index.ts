require('app-module-path').addPath(__dirname)

import config from 'config/env'
import logger from 'config/logger'
import httpStatus from 'http-status'

import mongoose from 'mongoose'
import * as util from 'util'

import app from 'config/express'

import { init } from 'config/typeorm'

init()

// module.parent check is required to support mocha watch
// src: https://github.com/mochajs/mocha/issues/1912
if (!module.parent) { // TODO check this with ava
  // listen on port config.PORT
  app.listen(config.PORT, () => {
    logger.info(`server started on port ${config.PORT} (${config.NODE_ENV})`)
  })
}
