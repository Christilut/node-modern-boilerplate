import { User, UserModel } from './model'

export async function get(id: string): Promise<User> {
  return UserModel.get(id)
}
