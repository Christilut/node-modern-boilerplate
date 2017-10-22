import * as Joi from 'joi'
import { IUpsertUserArgs } from 'server/models/user/mutations'
import { addUserValidation } from 'server/models/user/admin/mutations'

export const login = {
  email: Joi.string().required(),
  password: Joi.string().required()
}

export const register = addUserValidation
