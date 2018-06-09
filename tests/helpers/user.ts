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

  constructor(app, props?) {
    this.app = app

    this.user = new UserModel()

    this.user.name = faker.name.findName()
    this.user.email = faker.internet.email()
    this.user.password = testPassword

    if (props) {
      for (const p in props) {
        this.user[p] = props[p]
      }
    }
  }

  static async getLoggedInUser(app, props?) {
    let user = new TestUser(app, props)

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

  async rawQuery(query, expectedStatus = httpStatus.OK) {
    const result = await req(this.app)
      .post('/graphql')
      .set('content-type', 'application/json')
      .set('Authorization', this.token)
      .send(query)

    if (result.status !== expectedStatus) {
      console.log('Graphql Query failed: ' + JSON.stringify(result.body, null, '  '))
    }

    if (result.body.errors !== undefined) throw new Error(result.body.errors.map(x => x.message))

    return result.body.data
  }

  async query(query, expectedStatus = httpStatus.OK) {
    return this.rawQuery({ query }, expectedStatus)
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
