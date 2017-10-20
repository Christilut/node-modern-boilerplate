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
