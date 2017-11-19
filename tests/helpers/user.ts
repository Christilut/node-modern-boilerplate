import { User, UserModel, Roles } from 'server/models/user/model'
import * as mongoose from 'mongoose'
import * as faker from 'faker'
import * as req from 'supertest'
import * as httpStatus from 'http-status'

export const testPassword = faker.internet.password() + '1!'

export class TestUser {
  app
  user: User & mongoose.Document
  token: string

  constructor(app) {
    this.app = app

    this.user = new UserModel()

    this.user.name = faker.name.findName()
    this.user.email = faker.internet.email()
    this.user.password = testPassword
  }

  static async getLoggedInUser(app) {
    const user = new TestUser(app)

    await user.save()

    await user.login()

    return user
  }

  async addAdminRole() {
    this.user.roles.push(Roles.Admin)

    await this.save()

    await this.login()
  }

  async save() {
    await this.user.save()
  }

  async cleanup() {
    await this.user.remove()
  }

  async query(query) {
    const result = await req(this.app)
      .post('/graphql')
      .set('Authorization', this.token)
      .send({ query })
      .expect(httpStatus.OK)

    return result.body.data
  }

  async adminQuery(query) {
    const result = await req(this.app)
      .post('/admin-graphql')
      .set('Authorization', this.token)
      .send({ query })
      .expect(httpStatus.OK)

    return result.body.data
  }

  private async login() {
    this.token = await req(this.app)
      .post('/auth/login')
      .send({
        email: this.user.email,
        password: testPassword
      })
      .expect(httpStatus.OK)
      .then(r => r.body.token)
  }
}
