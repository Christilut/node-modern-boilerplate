import * as Joi from 'joi'
import { addUserValidation, IUpsertUserArgs } from 'server/models/user/mutations'

export const login = {
  email: Joi.string().required(),
  password: Joi.string().required()
}

export const register = addUserValidation
