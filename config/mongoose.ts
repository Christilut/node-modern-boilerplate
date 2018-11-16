import env from 'config/env'
import * as mongoose from 'mongoose'

(mongoose as any).Promise = Promise

// mongoose.set('debug', true)

if (env.NODE_ENV !== env.Environments.Test) {
  mongoose.connect(env.MONGO_HOST, {
    useNewUrlParser: true
    // keepAlive: 0 // TODO is this value needed? default is 0
  } as any)

  mongoose.connection.on('error', () => {
    throw new Error(`unable to connect to database`)
  })
}

export default mongoose

console.log('Mongoose:\t\tLoaded')
