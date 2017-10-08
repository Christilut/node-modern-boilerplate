const winston = require('winston')
const config = require('./config')
// const crypto = require('crypto')
// const WinstonCloudwatch = require('winston-cloudwatch')

const transports = []
// const startTime = new Date().toISOString()

if (config.NODE_ENV === 'production') {
  // transports.push(new (WinstonCloudwatch)({
  //   logGroupName: 'headless-api',
  //   logStreamName: function () {
  //     // Spread log streams across dates as the server stays up
  //     let date = new Date().toISOString().split('T')[0]
  //     return date + '-' +
  //       crypto.createHash('md5')
  //         .update(startTime)
  //         .digest('hex')
  //   },
  //   jsonMessage: true,
  //   awsAccessKeyId: config.awsAccessKey,
  //   awsSecretKey: config.awsSecret,
  //   awsRegion: config.awsRegion
  // }))
} else {
  transports.push(new (winston.transports.Console)({
    json: true,
    colorize: true
  }))
}

const logger = new (winston.Logger)({
  transports
})

global.logger = logger

module.exports = logger
