import env from 'config/env'
import * as mongoose from 'mongoose'
import * as mockgoose from 'mockgoose'

(mongoose as any).Promise = Promise

// connect to mongo db
if (env.NODE_ENV === 'test') {
  const mock = new mockgoose.Mockgoose(mongoose)

  // mockgoose.helper.setDbVersion('3.4.3')

  mock.prepareStorage().then(function () {
    mongoose.connect('mongodb://example.com/headless-test')
  })
} else {
  mongoose.connect(env.MONGO_HOST, {
    useMongoClient: true,
    keepAlive: true
  } as any) // mongoose typings dont appear to be up to date
}

mongoose.connection.on('error', () => {
  throw new Error(`unable to connect to database`)
})

export default mongoose

console.log('Loaded Mongoose')
