import { addUser } from 'server/models/user/admin/mutations'
import { User, UserModel } from 'server/models/user/model'
import * as mongoose from 'mongoose'
import * as faker from 'faker'

export const testPassword = faker.internet.password()

export default class UserHelper {
  static async generateUser(): Promise<User & mongoose.Document> {
    const user = new UserModel()

    user.name = faker.name.findName()
    user.email = faker.internet.email()
    user.password = testPassword

    await user.save()

    return user
  }
}
