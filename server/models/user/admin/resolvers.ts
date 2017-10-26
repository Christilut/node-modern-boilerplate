import env from 'config/env'
import { UserClass, User } from '../model'
import * as mutations from './mutations'
import * as query from './query'
import { login } from 'server/controllers/auth.controller'

export default {
  Query: {
    async users(): Promise<UserClass[]> {
      return query.getAll()
    }
  },

  Mutation: {
    async addUser(_, args): Promise<UserClass> { // TODO register uses this
      return mutations.addUser(args)
    },

    async updateUser(_, args): Promise<UserClass> {
      const id = args.id
      delete args.id // remove from args because id is not allowed in the validation

      return mutations.updateUser(id, args)
    },

    async removeUser(_, args): Promise<UserClass> {
      return mutations.removeUser(args.id)
    }
  }
}
