import { User, UserModel } from 'server/models/user/model'
import { strongPasswordRegex } from 'server/helpers/regex'
import validate from 'server/helpers/validation'
import * as Joi from 'joi'
import { APIError } from 'server/helpers/APIError'
import { IAddUserArgs, updateUser as defaultUpdateUser, addUserValidation } from 'server/models/user/mutations'

export interface IAdminUpdateUserArgs {
  name: string
  email: string
  password: string
}

export async function addUser(args: IAddUserArgs): Promise<User> {
  validate(args, addUserValidation)

  const user = new UserModel()

  for (const key of Object.keys(args)) {
    if (args[key] !== undefined) user[key] = args[key]
  }

  await user.save()

  return user
}

export async function updateUser(id: string, args: IAdminUpdateUserArgs): Promise<User> {
  return defaultUpdateUser(id, args)
}

export async function removeUser(id: string): Promise<User> {
  const user = await UserModel.get(id)

  await user.remove()

  return user
}
