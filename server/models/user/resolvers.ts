import { User } from './model'
import * as mutations from './mutations'

export default {
  Query: {
    user(_, { email }) {
      return User.findOne({
        email
      })
    }
  },

  Mutation: {
    updateUser(_, args) {
      return mutations.updateUser(args.id, args)
    }
  }
}
