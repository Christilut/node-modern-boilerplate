import env from 'config/env'
import * as mongoose from 'mongoose'

(mongoose as any).Promise = Promise

if (env.NODE_ENV !== 'test') {
  mongoose.connect(env.MONGO_HOST, {
    useMongoClient: true,
    keepAlive: true
  } as any) // mongoose typings dont appear to be up to date

  mongoose.connection.on('error', () => {
    throw new Error(`unable to connect to database`)
  })
}

export default mongoose

console.log('Mongoose: Loaded')
