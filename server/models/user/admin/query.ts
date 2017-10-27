import { User, UserModel } from '../model'

export async function getAll(): Promise<User[]> {
  return UserModel.find()
}
