require('app-module-path').addPath(__dirname)

import env from 'config/env'
import logger from 'config/logger'
import * as AWS from 'aws-sdk'

// TODO move to AWS helper file, class based?
// AWS.config.update({
//   accessKeyId: env.AWS_ACCESS_KEY,
//   secretAccessKey: env.AWS_SECRET,
//   region: env.AWS_REGION
// })

import 'config/mongoose'

import app from 'config/express'

if (env.NODE_ENV === 'production') {
  require('config/sentry')

  require('config/forestadmin')
}

(async () => {
  // module.parent check is required to support mocha watch
  // src: https://github.com/mochajs/mocha/issues/1912
  if (!module.parent) { // TODO check this with ava
    // listen on port config.PORT
    app.listen(env.PORT, () => {
      logger.info(`server started on port ${env.PORT} (${env.NODE_ENV})`)
    })
  }
})()
