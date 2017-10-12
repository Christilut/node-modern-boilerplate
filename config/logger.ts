const winston = require('winston')
import env from 'config/env'
// const crypto = require('crypto')
// import * as WinstonCloudwatch from 'winston-cloudwatch'

const transports = []

if (env.NODE_ENV === 'production') {
  // const startTime = new Date().toISOString()

  // transports.push(new WinstonCloudwatch({
  //   logGroupName: 'boilerplate-api',
  //   logStreamName: function () {
  //     // Spread log streams across dates as the server stays up
  //     let date = new Date().toISOString().split('T')[0]
  //     return date + '-' +
  //       crypto.createHash('md5')
  //         .update(startTime)
  //         .digest('hex')
  //   },
  //   jsonMessage: true,
  //   awsAccessKeyId: config.awsAccessKey, // TODO
  //   awsSecretKey: config.awsSecret,
  //   awsRegion: config.awsRegion
  // }))
} else {
  transports.push(new winston.transports.Console({
    json: true,
    colorize: true
  }))
}

export default new winston.Logger({
  transports
})
