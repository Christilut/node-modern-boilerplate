import * as mongoose from 'mongoose'
import * as mockgoose from 'mockgoose'

(mongoose as any).Promise = Promise

// connect to mongo db
const mock = new mockgoose.Mockgoose(mongoose)

mock.prepareStorage().then(function () {
  mongoose.connect('mongodb://example.com/headless-test', {
    useMongoClient: true
  } as any)
})

mongoose.connection.on('error', () => {
  throw new Error(`unable to connect to database`)
})

export default mongoose
