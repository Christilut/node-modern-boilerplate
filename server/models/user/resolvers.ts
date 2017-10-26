import env from 'config/env'
import { UserClass, User } from './model'
import * as mutations from './mutations'
import * as query from './query'
import { login } from 'server/controllers/auth.controller'

export default {
  Query: {
    // Returns sanitized User object of the currently logged in user (based on the request JWT)
    async me(_, args, context): Promise<UserClass> {
      const id: string = context.user.id

      return query.get(id)
    }
  },

  Mutation: {
    // Updates user properties
    async updateUser(_, args, context): Promise<UserClass> {
      return mutations.updateUser(context.user.id, args)
    }
  }
}
