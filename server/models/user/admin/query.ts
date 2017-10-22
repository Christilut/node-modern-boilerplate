import { User, UserType } from '../model'

export async function getAll(): Promise<UserType[]> {
  return User.find()
}
