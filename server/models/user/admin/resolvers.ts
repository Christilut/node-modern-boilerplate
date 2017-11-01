import env from 'config/env'
import { User, UserModel } from '../model'
import * as mutations from './mutations'
import * as adminQuery from './query'
import * as userQuery from '../query'
import { login } from 'server/controllers/auth.controller'

export default {
  Query: {
    async user(_, args): Promise<User> {
      return userQuery.get(args)
    },

    async users(): Promise<User[]> {
      return adminQuery.getAll()
    }
  },

  Mutation: {
    async addUser(_, args): Promise<User> { // TODO register uses this
      return mutations.addUser(args)
    },

    async updateUser(_, args): Promise<User> {
      const id = args.id
      delete args.id // remove from args because id is not allowed in the validation

      return mutations.updateUser(id, args)
    },

    async removeUser(_, args): Promise<User> {
      return mutations.removeUser(args.id)
    }
  }
}
