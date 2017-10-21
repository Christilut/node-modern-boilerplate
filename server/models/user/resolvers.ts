import env from 'config/env'
import { User, UserType } from './model'
import * as mutations from './mutations'
import { login } from 'server/controllers/auth.controller'

export default {
  Query: {
    /**
     * Returns sanitized User object of the currently logged in user (based on the request JWT)
     */
    async me(_, args, context): Promise<UserType> {
      const email: string = context.user.email

      return User.findOne({
        email
      })
    }
  },

  Mutation: {
    async addUser(_, args): Promise<UserType> { // TODO register uses this and admin graphql
      return mutations.addUser(args)
    },

    async updateUser(_, args): Promise<UserType> {
      // Remove id from args because otherwise it will try to update ID (which is pointless)
      const id = args.id
      delete args.id

      return mutations.updateUser(id, args)
    }
  }
}
