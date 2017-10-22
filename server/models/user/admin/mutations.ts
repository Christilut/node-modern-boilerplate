import { User, UserType } from '../model'
import { strongPasswordRegex } from 'server/helpers/regex'
import validate from 'server/helpers/validation'
import * as Joi from 'joi'
import APIError from 'server/helpers/APIError'
import { IUpsertUserArgs, updateUser as defaultUpdateUser, addUserValidation } from 'server/models/user/mutations'

export async function addUser(args: IUpsertUserArgs): Promise<UserType> {
  validate(args, addUserValidation)

  const user: UserType = new User()

  for (const key of Object.keys(args)) {
    if (args[key] !== undefined) user[key] = args[key]
  }

  await user.save()

  return user
}

export async function updateUser(id: string, args: IUpsertUserArgs): Promise<UserType> {
  return defaultUpdateUser(id, args)
}

export async function removeUser(id: string): Promise<UserType> {
  const user: UserType = await User.get(id)

  await user.remove()

  return user
}
