import env from 'config/env'
import * as mongoose from 'mongoose'
import * as mockgoose from 'mockgoose'

// connect to mongo db
if (env.NODE_ENV === 'test') {
  const mock = new mockgoose.Mockgoose(mongoose)

  // mockgoose.helper.setDbVersion('3.4.3')

  mock.prepareStorage().then(function () {
    mongoose.connect('mongodb://example.com/headless-test')
  })
} else {
  mongoose.connect(env.MONGO_HOST, {
    server: {
      socketOptions: {
        keepAlive: 1
      }
    }
  })
}

mongoose.connection.on('error', () => {
  throw new Error(`unable to connect to database`)
})
