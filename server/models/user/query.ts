import { UserClass, User } from './model'

export async function get(id: string): Promise<UserClass> {
  return User.get(id)
}
