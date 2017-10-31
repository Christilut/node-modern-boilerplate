const winston = require('winston')
import env from 'config/env'
const crypto = require('crypto')
const WinstonCloudwatch = require('winston-cloudwatch')

const transports = []
// console.log(module.parent.parent)
if (!module.parent.parent) { // Only load if called from startup index file
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

    console.log('Winston Cloudwatch: Loaded')
  } else {
    console.log('Winston Cloudwatch: Missing AWS credentials, not loading')
  }
} else if (env.NODE_ENV === env.Environments.Production) {
  console.log('Winston Cloudwatch: Not loading outside production environment')
}

if (env.NODE_ENV !== env.Environments.Test) {
  transports.push(new winston.transports.Console({
    json: true,
    colorize: true
  }))
}

export default new winston.Logger({
  transports
})
