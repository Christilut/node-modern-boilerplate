require('app-module-path').addPath(__dirname + '/..')

import('tests/helpers/mongo')
import test from 'ava'
import * as httpStatus from 'http-status'
import app from 'config/express'
import * as req from 'supertest'
import * as Joi from 'joi'
import { testPassword, TestUser } from './helpers/user'
import validate from './helpers/validation'
import * as faker from 'faker'

/**
 * This file tests registration, validation of those calls, account verification, password reset, password forgot.
 */

//#region Register input validation
test('validation error when email is not given', async t => {
  await req(app)
    .post('/auth/register')
    .send({
      password: testPassword
    })
    .expect(httpStatus.BAD_REQUEST)

  t.pass()
})

test('validation error when email is not a valid email address', async t => {
  await req(app)
    .post('/auth/register')
    .send({
      email: 'test',
      name: faker.name.findName(),
      password: testPassword
    })
    .expect(httpStatus.BAD_REQUEST)

  t.pass()
})

test('validation error when email is empty', async t => {
  await req(app)
    .post('/auth/register')
    .send({
      email: '',
      name: faker.name.findName(),
      password: testPassword
    })
    .expect(httpStatus.BAD_REQUEST)

  t.pass()
})

test('validation error when password is not given', async t => {
  await req(app)
    .post('/auth/register')
    .send({
      email: faker.internet.email(),
      name: faker.name.findName()
    })
    .expect(httpStatus.BAD_REQUEST)

  t.pass()
})

test('validation error when password is weak', async t => {
  await req(app)
    .post('/auth/register')
    .send({
      email: faker.internet.email(),
      name: faker.name.findName(),
      password: 'test'
    })
    .expect(httpStatus.BAD_REQUEST)

  t.pass()
})

test('validation error when password is empty', async t => {
  await req(app)
    .post('/auth/register')
    .send({
      email: faker.internet.email(),
      name: faker.name.findName(),
      password: ''
    })
    .expect(httpStatus.BAD_REQUEST)

  t.pass()
})

test('validation error when name is not given', async t => {
  await req(app)
    .post('/auth/register')
    .send({
      email: faker.internet.email(),
      password: testPassword
    })
    .expect(httpStatus.BAD_REQUEST)

  t.pass()
})

test('validation error when name is empty', async t => {
  await req(app)
    .post('/auth/register')
    .send({
      name: '',
      email: faker.internet.email(),
      password: testPassword
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
      name: faker.name.findName(),
      email: faker.internet.email(),
      password: testPassword
    })
    .expect(httpStatus.OK)

  validate(res.body, {
    token: Joi.string().required(),
    user: Joi.object().required().keys({
      id: Joi.string().required(),
      name: Joi.string().required(),
      email: Joi.string().required(),
      roles: Joi.array().required()
    })
  })

  t.pass()
})

test('fails with CONFLICT if email taken', async t => {
  const body = {
    name: faker.name.findName(),
    email: faker.internet.email(),
    password: testPassword
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
