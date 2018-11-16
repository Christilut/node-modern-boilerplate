// Set base module path so imports resolve
require('app-module-path').addPath(__dirname + '/..')

// Init in-memory database
import('tests/helpers/mongo')

// Launch express on random port
import app from 'config/express'

// Import libraries needed for testing
import test from 'ava'
import * as faker from 'faker'
import * as httpStatus from 'http-status'
import * as Joi from 'joi'
import * as mongoose from 'mongoose'
import * as req from 'supertest'
import { generateRandomDatabaseName } from './helpers/mongo'
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
 * This file tests registration, validation of those calls, account verification, password reset, password forgot.
 */

//#region Register input validation
test('validation error when email is not given', async t => {
  await req(app)
    .post('/auth/register')
    .send({})
    .expect(httpStatus.BAD_REQUEST)

  t.pass()
})

test('validation error when email is not a valid email address', async t => {
  await req(app)
    .post('/auth/register')
    .send({
      email: 'test'
    })
    .expect(httpStatus.BAD_REQUEST)

  t.pass()
})

test('validation error when email is empty', async t => {
  await req(app)
    .post('/auth/register')
    .send({
      email: ''
    })
    .expect(httpStatus.BAD_REQUEST)

  t.pass()
})
//#endregion

//#region Register success & errors
test('registration succesful', async t => {
  const res = await req(app)
    .post('/auth/register')
    .send({
      email: faker.internet.email()
    })
    .expect(httpStatus.OK)

  validate(res.body, {
    token: Joi.string().required(),
    user: Joi.object().required().keys({
      id: Joi.string().required(),
      email: Joi.string().required(),
      roles: Joi.array().required()
    })
  })

  t.pass()
})

test('fails with CONFLICT if email taken', async t => {
  const body = {
    email: faker.internet.email()
  }

  await req(app)
    .post('/auth/register')
    .send(body)
    .expect(httpStatus.OK)

  await req(app)
    .post('/auth/register')
    .send(body)
    .expect(httpStatus.CONFLICT)

  t.pass()
})
 //#endregion

 //#region Account verification

 //#endregion

 //#region Password reset

 //#endregion

 //#region Password forgot

 //#endregion
