import { UserClass, User } from '../model'

export async function getAll(): Promise<UserClass[]> {
  return User.find()
}
