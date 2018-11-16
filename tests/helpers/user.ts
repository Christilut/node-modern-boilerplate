import app from 'config/express'
import * as faker from 'faker'
import * as httpStatus from 'http-status'
import * as mongoose from 'mongoose'
import * as Randomize from 'randomatic'
import { User, UserModel } from 'server/models'
import * as req from 'supertest'

export const testPassword = faker.internet.password() + '1!'

export class TestUser {
  app
  user: User & mongoose.Document
  token: string

  constructor() {
    this.app = app
  }

  static async getLoggedInUser(props?) {
    let user = new TestUser()

    await user.init(props)

    await user.login()

    return user
  }

  async init(props?) {
    this.user = new UserModel()

    this.user.email = faker.internet.email().toLowerCase()
    this.user.password = testPassword

    if (props) {
      Object.assign(this.user, props)
    }

    await this.user.save()
  }

  async cleanup() {
    this.user = await UserModel.findById(this.user.id)

    await this.user.remove()
  }

  async rawQuery(query, expectedStatus: number = httpStatus.OK) {
    const result = await req(this.app)
      .post('/graphql')
      .set('content-type', 'application/json')
      .set('Authorization', this.token)
      .send(query)

    if (result.status !== expectedStatus) {
      console.log('Graphql Query/Mutation failed: ' + JSON.stringify(result.body, null, '  '))
    }

    if (result.body.errors !== undefined) {
      // console.log(JSON.stringify(result.body), null, '  ')
      throw new Error(result.body.errors.map(x => x.message))
    }

    return result.body.data
  }

  async query(query, expectedStatus: number = httpStatus.OK) {
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
