import { User, UserModel } from './model'
import { InstanceType } from 'typegoose'

export async function getUser(user: InstanceType<User>): Promise<User> {
  return UserModel.get(user._id)
}
