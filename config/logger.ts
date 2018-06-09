import env from 'config/env'
const winston = require('winston')
const WinstonCloudwatch = require('winston-cloudwatch')

const transports = []

if (!module.parent.parent) { // Only load if called from startup index file
  if (!env.AWS_LOG_GROUP) {
    console.log('Winston Cloudwatch: Not loading outside production environment')
  } else {
    // const startTime = new Date().toISOString()

    transports.push(new WinstonCloudwatch({
      logGroupName: env.AWS_LOG_GROUP,
      logStreamName: function () {
        let date = new Date().toISOString().split('T')[0]

        return date

        // Enable below to add random string to log name in order to differentiate multiple processes or restarts.
        // + '-' +
        //   crypto.createHash('md5')
        //     .update(startTime)
        //     .digest('hex')
      },
      jsonMessage: true
    }))

    console.log('Winston Cloudwatch: Loaded')
  }
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
