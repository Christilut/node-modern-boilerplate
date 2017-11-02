// Set base module path so imports resolve
require('app-module-path').addPath(__dirname + '/..')

// Init in-memory database
import('tests/helpers/mongo')

// Launch express on random port
import app from 'config/express'

// Import libraries needed for testing
import test from 'ava'
import * as httpStatus from 'http-status'
import * as req from 'supertest'
import * as Joi from 'joi'
import * as faker from 'faker'
import { testPassword, TestUser } from './helpers/user'
import validate from './helpers/validation'

/**
 * This file tests every aspect of logging in. From success to failures.
 */

//#region Validation & permission errors
test('forbidden when user does not exist', async t => {
  await req(app)
    .post('/auth/login')
    .send({
      email: faker.internet.email(),
      password: testPassword
    })
    .expect(httpStatus.FORBIDDEN)

  t.pass()
})

test('validation error when email is not given', async t => {
  await req(app)
    .post('/auth/login')
    .send({
      password: testPassword
    })
    .expect(httpStatus.BAD_REQUEST)

  t.pass()
})

test('validation error when email is empty', async t => {
  await req(app)
    .post('/auth/login')
    .send({
      email: '',
      password: testPassword
    })
    .expect(httpStatus.BAD_REQUEST)

  t.pass()
})

test('forbidden when email is not a valid email', async t => { // because email is not validated on login, incase validation changes later
  await req(app)
    .post('/auth/login')
    .send({
      email: 'test',
      password: testPassword
    })
    .expect(httpStatus.FORBIDDEN)

  t.pass()
})

test('validation error when password is not given', async t => {
  await req(app)
    .post('/auth/login')
    .send({
      email: faker.internet.email()
    })
    .expect(httpStatus.BAD_REQUEST)

  t.pass()
})

test('validation error when password is empty', async t => {
  await req(app)
    .post('/auth/login')
    .send({
      email: faker.internet.email(),
      password: ''
    })
    .expect(httpStatus.BAD_REQUEST)

  t.pass()
})

test('forbidden error when password is wrong', async t => {
  const u = new TestUser(app)

  await u.save()

  await req(app)
    .post('/auth/login')
    .send({
      email: u.user.email,
      password: 'wrongpassword'
    })
    .expect(httpStatus.FORBIDDEN)

  await u.cleanup()

  t.pass()
})

test('forbidden error when trying to use admin graphql endpoint without admin role', async t => {
  const admin = await TestUser.getLoggedInUser(app)

  await req(admin.app)
    .post('/admin-graphql')
    .set('Authorization', admin.token)
    .send({
      query: `
        query {
          user(id: "${123}") {
            id
          }
        }
      `})
    .expect(httpStatus.FORBIDDEN)

  await admin.cleanup()

  t.pass()
})
//#endregion

//#region Succesful login
test('succesful login', async t => {
  const u = await TestUser.getLoggedInUser(app)

  t.truthy(u.token)

  await u.cleanup()

  t.pass()
})
//#endregion

//#region User read & update self
test('get own user info and confirm all allowed properties exist', async t => {
  const u = await TestUser.getLoggedInUser(app)

  const data = await u.query(`
    query {
      me {
        id,
        name,
        email
      }
    }`
  )

  validate(data.me, {
    id: Joi.string().required(),
    name: Joi.string().required(),
    email: Joi.string().email().required(),
    password: Joi.string().forbidden()
  })

  await u.cleanup()

  t.pass()
})

test('update own user info and confirm', async t => {
  const u = await TestUser.getLoggedInUser(app)

  await u.query(`
    mutation {
      updateUser(name: "test") {
        id
      }
    }`
  )

  const data = await u.query(`
    query {
      me {
        name
      }
    }`
  )

  validate(data.me, {
    name: Joi.any().equal('test')
  })

  await u.cleanup()

  t.pass()
})
//#endregion
