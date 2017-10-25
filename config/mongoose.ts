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

// AbstractModel to combine Typescript interface with Mongoose schema
import { MongooseDocument, Model, Document } from 'mongoose'

export interface IAbstractModel extends MongooseDocument {
  __v?: number
  update(data: any)
  increment?(): this
  model?(name: string): Model<Document>
  remove?(fn?: (err: any, product: this) => void): Promise<this>
  save?(fn?: (err: any, product: this, numAffected: number) => void): Promise<this>
}

export abstract class AbstractModel {}

console.log('Loaded Mongoose')
