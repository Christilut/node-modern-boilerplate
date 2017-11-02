import { User, UserModel } from './model'
import * as Joi from 'joi'
import { validate } from 'server/helpers/validation'

export interface IGetUserArgs {
  id: string
}

export const getUserValidation: IGetUserArgs = {
  id: Joi.string().required() as any
}

export async function get(args: IGetUserArgs): Promise<User> {
  validate(args, getUserValidation)

  return UserModel.get(args.id)
}
