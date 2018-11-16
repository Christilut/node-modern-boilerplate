import { User } from './model'
import * as mutations from './mutations'
import * as query from './query'

export default {
  Query: {
    // Returns sanitized User object of the currently logged in user (based on the request JWT)
    async me(_, args, context): Promise<User> {
      return query.getUser(context.user)
    }
  },

  Mutation: {
    // Updates user properties
    async updateUser(_, args, context): Promise<User> {
      return mutations.updateUser(context.user.id, args)
    }
  }
}
