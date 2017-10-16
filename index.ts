require('app-module-path').addPath(__dirname)

import env from 'config/env'
import * as AWS from 'aws-sdk'

// TODO move to AWS helper file, class based?
// AWS.config.update({
//   accessKeyId: env.AWS_ACCESS_KEY,
//   secretAccessKey: env.AWS_SECRET,
//   region: env.AWS_REGION
// })

import logger from 'config/logger'
import httpStatus from 'http-status'

import * as util from 'util'

import { init as initDatabase } from 'config/typeorm'

import app from 'config/express'

(async () => {
  await initDatabase()

  // module.parent check is required to support mocha watch
  // src: https://github.com/mochajs/mocha/issues/1912
  if (!module.parent) { // TODO check this with ava
    // listen on port config.PORT
    app.listen(env.PORT, () => {
      logger.info(`server started on port ${env.PORT} (${env.NODE_ENV})`)
    })
  }
})()
