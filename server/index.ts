require('app-module-path').addPath(__dirname + '/..')

import 'config/aws'
import 'config/logger'
import 'config/sentry'
import 'config/mongoose'
import 'config/express'

// module.parent check is required to support mocha watch
// src: https://github.com/mochajs/mocha/issues/1912
if (!module.parent) { // TODO check this with ava
  // listen on port config.PORT

}
