import env from 'config/env'
import * as AWS from 'aws-sdk'

AWS.config.update({
  region: env.AWS_REGION,
  accessKeyId: env.AWS_ACCESS_KEY_ID,
  secretAccessKey: env.AWS_SECRET_ACCESS_KEY
})

console.log('AWS:\t\t\tLoaded')
