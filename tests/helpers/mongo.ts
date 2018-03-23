import MongodbMemoryServer from 'mongodb-memory-server'
import * as mongoose from 'mongoose'
import test from 'ava'

(mongoose as any).Promise = Promise

const mongod = new MongodbMemoryServer()

// Create connection to Mongoose before tests are run
test.before(async () => {
  const uri = await mongod.getConnectionString()

  await mongoose.connect(uri)
})
