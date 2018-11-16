require('app-module-path').addPath(__dirname + '/..')

import 'config/aws'
import 'config/logger'
import 'config/sentry'
import 'config/mongoose'
import 'config/express'
import 'server/models'
