import { User } from './model'
import * as mutations from './mutations'
import { strongPasswordRegex } from 'server/helpers/regex'
import validate from 'server/helpers/validation'
import * as Joi from 'joi'

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
      // Remove id from args because otherwise it will try to update ID (which is pointless)
      const id = args.id
      delete args.id

      // Validate properties
      validate(args, Joi.object().keys({
        name: Joi.string().max(64).min(2),
        email: Joi.string().email(),
        password: Joi.string().regex(strongPasswordRegex).description('password weak')
      }))

      return mutations.updateUser(id, args)
    }
  }
}
