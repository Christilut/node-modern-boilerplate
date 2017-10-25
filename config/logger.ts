const winston = require('winston')
import env from 'config/env'
const crypto = require('crypto')
const WinstonCloudwatch = require('winston-cloudwatch')

const transports = []

if (env.NODE_ENV === 'production') {
  if (env.CLOUDWATCH_ACCESS_KEY && env.CLOUDWATCH_REGION && env.CLOUDWATCH_SECRET) {
    const startTime = new Date().toISOString()

    transports.push(new WinstonCloudwatch({
      logGroupName: 'boilerplate-api',
      logStreamName: function () {
        let date = new Date().toISOString().split('T')[0]

        return date

        // Enable below to add random string to log name in order to differentiate multiple processes or restarts.
        // + '-' +
        //   crypto.createHash('md5')
        //     .update(startTime)
        //     .digest('hex')
      },
      jsonMessage: true,
      awsAccessKeyId: env.CLOUDWATCH_ACCESS_KEY,
      awsSecretKey: env.CLOUDWATCH_SECRET,
      awsRegion: env.CLOUDWATCH_REGION
    }))

    console.log('Loaded Winston to AWS Cloudwatch')
  } else {
    console.log('Missing AWS credentials for Winston Cloudwatch, not loading')
  }
}

transports.push(new winston.transports.Console({
  json: true,
  colorize: true
}))

export default new winston.Logger({
  transports
})
