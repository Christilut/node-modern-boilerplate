import env from 'config/env'
import { User, UserType } from '../model'
import * as mutations from './mutations'
import * as query from './query'
import { login } from 'server/controllers/auth.controller'

export default {
  Query: {
    async users(): Promise<UserType[]> {
      return query.getAll()
    }
  },

  Mutation: {
    async addUser(_, args): Promise<UserType> { // TODO register uses this
      return mutations.addUser(args)
    },

    async updateUser(_, args): Promise<UserType> {
      const id = args.id
      delete args.id // remove from args because id is not allowed in the validation

      return mutations.updateUser(id, args)
    },

    async removeUser(_, args): Promise<UserType> {
      return mutations.removeUser(args.id)
    }
  }
}
