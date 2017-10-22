import { User, UserType } from './model'

export async function get(id: string): Promise<UserType> {
  return User.get(id)
}
