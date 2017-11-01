import env from 'config/env'
import { User, UserModel } from './model'
import * as mutations from './mutations'
import * as query from './query'

export default {
  Query: {
    // Returns sanitized User object of the currently logged in user (based on the request JWT)
    async me(_, args, context): Promise<User> {
      const id: string = context.user.id

      return query.get({
        id
      })
    }
  },

  Mutation: {
    // Updates user properties
    async updateUser(_, args, context): Promise<User> {
      return mutations.updateUser(context.user.id, args)
    }
  }
}
