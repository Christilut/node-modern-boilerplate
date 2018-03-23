import { User, UserModel } from './model'
import { strongPasswordRegex } from 'server/helpers/regex'
import { validate } from 'server/helpers/validation'
import * as Joi from 'joi'
import { APIError } from 'server/helpers/error'

export interface IAddUserArgs {
  name: string
  email: string
  password: string
}

export interface IUpdateUserArgs {
  name?: string
  password?: string
}

export const addUserValidation: IAddUserArgs = {
  name: Joi.string().max(64).min(2).required() as any,
  email: Joi.string().email().required() as any,
  password: Joi.string().regex(strongPasswordRegex).required() as any
}

const updateUserValidation: IUpdateUserArgs = {
  name: Joi.string().max(64).min(2).optional() as any,
  password: Joi.string().regex(strongPasswordRegex).optional() as any
}

export async function updateUser(id: string, args: IUpdateUserArgs): Promise<User> {
  validate(args, updateUserValidation)

  const user = await UserModel.get(id)

  if (!user) throw new APIError('user not found', httpStatus.NOT_FOUND)

  for (const key of Object.keys(args)) {
    if (args[key] !== undefined) user[key] = args[key]
  }

  await user.save()

  return user
}
