// Set base module path so imports resolve
require('app-module-path').addPath(__dirname + '/..')

// Import libraries needed for testing
import test from 'ava'
import * as faker from 'faker'
import * as httpStatus from 'http-status'
import * as Joi from 'joi'
import * as mongoose from 'mongoose'
import { generateRandomDatabaseName } from './helpers/mongo'
import { post } from './helpers/request'
import { testPassword, TestUser } from './helpers/user'
import validate from './helpers/validation'

test.before(async t => {
  const uri = 'mongodb://localhost/' + generateRandomDatabaseName()

  await mongoose.connect(uri, {
    useNewUrlParser: true
  })
})

test.after.always(async t => {
  await mongoose.connection.db.dropDatabase()
})

/**
 * This file tests every aspect of logging in. From success to failures.
 */

//#region Validation & permission errors
test('login - forbidden when user does not exist', async t => {
  await post('/auth/login', {
    email: faker.internet.email(),
    password: testPassword
  }, httpStatus.FORBIDDEN)

  t.pass()
})

test('login - validation error when email is not given', async t => {
  await post('/auth/login', {
    password: testPassword
  }, httpStatus.BAD_REQUEST)

  t.pass()
})

test('login - validation error when email is empty', async t => {
  await post('/auth/login', {
    email: '',
    password: testPassword
  }, httpStatus.BAD_REQUEST)

  t.pass()
})

test('login - forbidden when email is not a valid email', async t => { // because email is not validated on login, incase validation changes later
  await post('/auth/login', {
    email: 'test',
    password: testPassword
  }, httpStatus.FORBIDDEN)

  t.pass()
})

test('login - validation error when password is not given', async t => {
  await post('/auth/login', {
    email: faker.internet.email()
  }, httpStatus.BAD_REQUEST)

  t.pass()
})

test('login - validation error when password is empty', async t => {
  await post('/auth/login', {
    email: faker.internet.email(),
    password: ''
  }, httpStatus.BAD_REQUEST)

  t.pass()
})

test('login - error when account is inactive', async t => {
  const u = new TestUser()

  await u.init({
    _active: false
  })

  await post('/auth/login', {
    email: u.user.email,
    password: testPassword
  }, httpStatus.UNAUTHORIZED)

  await u.cleanup()

  t.pass()
})

test('login - forbidden error when password is wrong', async t => {
  const u = new TestUser()

  await u.init()

  await post('/auth/login', {
    email: u.user.email,
    password: 'wrongpassword'
  }, httpStatus.FORBIDDEN)

  await u.cleanup()

  t.pass()
})
//#endregion

//#region Succesful login
test('login - succesful login', async t => {
  const u = await TestUser.getLoggedInUser()

  t.truthy(u.token)

  await u.cleanup()

  t.pass()
})
//#endregion

//#region User read & update self
test('login - get own user and confirm all allowed properties exist', async t => {
  const u = await TestUser.getLoggedInUser()

  const data = await u.query(`
    query {
      me {
        id
        email
      }
    }`
  )

  t.truthy(data.me)
  t.true(data.me.id === u.user.id)
  t.true(data.me.email === u.user.email)
  t.true(data.me.password === undefined)

  await u.cleanup()

  t.pass()
})

// test('login - update own user info and confirm', async t => {
//   const u = await TestUser.getLoggedInUser()

//   await u.query(`
//     mutation {
//       updateUser(name: "test") {
//         id
//       }
//     }`
//   )

//   const data = await u.query(`
//     query {
//       me {
//         name
//       }
//     }`
//   )

//   validate(data.me, {
//     name: Joi.any().equal('test')
//   })

//   await u.cleanup()

//   t.pass()
// })
//#endregion

test('login - try forgot password with unknown email and confirm there is no error and no way to tell the email doesnt exist', async t => {
  await post('/auth/forgot-password', {
    email: 'doesnotexist@example.com'
  }, httpStatus.OK)

  t.pass()
})
