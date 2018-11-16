import { User, UserModel } from './model'
import { strongPasswordRegex } from 'server/helpers/regex'
import { validate } from 'server/helpers/validation'
import * as Joi from 'joi'
import { APIError } from 'server/helpers/error'
import * as httpStatus from 'http-status'

export interface IUpdateUserArgs {
  password?: string
}

const updateUserValidation: IUpdateUserArgs = {
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
