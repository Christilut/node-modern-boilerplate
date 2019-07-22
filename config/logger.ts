import env from 'config/env'
const winston = require('winston')
const { format } = require('winston')
const WinstonCloudwatch = require('winston-cloudwatch')

const transports = []

function consoleFormatter(info) {
  const { level, message, durationMs, ...meta } = info

  let output = `${level}: ${message}`

  if (info.hasOwnProperty('durationMs')) output = `${output} (duration: ${durationMs}ms)`

  if (Object.keys(meta).length > 0) {
    if (meta.err) {
      delete info.meta.err.config // Delete circular objects from the request that arent interesting anyway
      delete info.meta.err.request
    }

    output += '\n'
    output += JSON.stringify(meta, null, '  ')
    output += '\n'
  }

  if (info.extra) {
    output += '\n'
    output += JSON.stringify(info.extra, null, '  ')
    output += '\n'
  }

  return output
}

if (env.NODE_ENV !== env.Environments.Test) {
  if (!env.AWS_LOG_GROUP) {
    console.log('Winston Cloudwatch:\tNo log group name found, not loading')
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

    console.log('Winston Cloudwatch:\tLoaded')
  }
}

if (env.NODE_ENV !== env.Environments.Test) {
  transports.push(new winston.transports.Console({
    format: format.combine(
      format.colorize(),
      format.splat(),
      winston.format.printf(consoleFormatter)
    )
  }))
}

export default winston.createLogger({
  transports,
  silent: env.NODE_ENV === env.Environments.Test
})
