// import MongodbMemoryServer from 'mongodb-memory-server'
import * as mongoose from 'mongoose'
import * as randomatic from 'randomatic'
import env from 'config/env'

(mongoose as any).Promise = Promise

if (env.NODE_ENV === env.Environments.Test) { // Prevents deprecation warnings
  mongoose.set('useCreateIndex', true)
  mongoose.set('useFindAndModify', false)
}

// You can use the mem db server instead of a localhost server but it's slower and might get stuck during tests...
// const mongod = new MongodbMemoryServer()
// const uri = await mongod.getConnectionString()

// All test files run in their own worker but they should share the same database
const databaseName = 'boilerplate-test-' + randomatic('Aa0', 20)

export function generateRandomDatabaseName() {
  return databaseName
}
