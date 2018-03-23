import env from 'config/env'
import * as mongoose from 'mongoose'

(mongoose as any).Promise = Promise

if (env.NODE_ENV !== env.Environments.Test) {
  mongoose.connect(env.MONGO_HOST, {
    // keepAlive: 0 // TODO is this value needed? default is 0
  })

  mongoose.connection.on('error', () => {
    throw new Error(`unable to connect to database`)
  })
}

export default mongoose

console.log('Mongoose: Loaded')
