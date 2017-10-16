import { User } from './model'

export default {
  Query: {
    user(root, { email }) {
      return User.findOne({
        email
      })
    }
  },

  Mutation: {
    updateUser(root, { name, email }) {
      return User.findOne({ name, email })
    }
  }
}
