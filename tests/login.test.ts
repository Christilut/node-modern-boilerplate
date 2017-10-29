require('app-module-path').addPath(__dirname + '/..')

import('tests/helpers/mockgoose')
import test from 'ava'
import * as httpStatus from 'http-status'
import app from 'config/express'
import * as req from 'supertest'
import * as Joi from 'joi'
import UserHelper, { testPassword } from './helpers/user'
import validate from './helpers/validation'

/**
 * This file tests every aspect of logging in. From success to failures.
 */

//#region Validation & permission errors
test('forbidden when user does not exist', async t => {
  await req(app)
    .post('/auth/login')
    .send({
      email: 'test@test.com',
      password: 'test'
    })
    .expect(httpStatus.FORBIDDEN)

  t.pass()
})

test('validation error when email is not given', async t => {
  await req(app)
    .post('/auth/login')
    .send({
      password: 'test'
    })
    .expect(httpStatus.BAD_REQUEST)

  t.pass()
})

test('validation error when email is empty', async t => {
  await req(app)
    .post('/auth/login')
    .send({
      email: '',
      password: 'test'
    })
    .expect(httpStatus.BAD_REQUEST)

  t.pass()
})

test('forbidden when email is not a valid email', async t => { // because email is not validated on login, incase validation changes later
  await req(app)
    .post('/auth/login')
    .send({
      email: 'test',
      password: 'test'
    })
    .expect(httpStatus.FORBIDDEN)

  t.pass()
})

test('validation error when password is not given', async t => {
  await req(app)
    .post('/auth/login')
    .send({
      email: 'test@test.com'
    })
    .expect(httpStatus.BAD_REQUEST)

  t.pass()
})

test('validation error when password is empty', async t => {
  await req(app)
    .post('/auth/login')
    .send({
      email: 'test@test.com',
      password: ''
    })
    .expect(httpStatus.BAD_REQUEST)

  t.pass()
})

test('forbidden error when password is wrong', async t => {
  const user = await UserHelper.generateUser()

  await req(app)
    .post('/auth/login')
    .send({
      email: user.email,
      password: 'wrongpassword'
    })
    .expect(httpStatus.FORBIDDEN)

  await user.remove()

  t.pass()
})

test('invalid route on GET endpoint', async t => {
  await req(app)
    .get('/auth/login')
    .expect(httpStatus.NOT_FOUND)

  t.pass()
})

test('invalid route on PUT endpoint', async t => {
  await req(app)
    .put('/auth/login')
    .expect(httpStatus.NOT_FOUND)

  t.pass()
})

test('invalid route on DEL endpoint', async t => {
  await req(app)
    .delete('/auth/login')
    .expect(httpStatus.NOT_FOUND)

  t.pass()
})
//#endregion

//#region Succesful login
test('succesful login', async t => {
  const user = await UserHelper.generateUser()

  const body = await req(app)
    .post('/auth/login')
    .send({
      email: user.email,
      password: testPassword
    })
    .expect(httpStatus.OK)
    .then(r => r.body) // This is done so it only returns the body. If we put the entire response in t.truthy() then power-assert will spam too much if it fails.

  validate(body, {
    token: Joi.string().required()
  })

  await user.remove()

  t.pass()
})
//#endregion

//#region User read & update self
test('get own user info and confirm all allowed properties exist', async t => {
  const user = await UserHelper.generateUser()

  const token = await req(app)
    .post('/auth/login')
    .send({
      email: user.email,
      password: testPassword
    })
    .expect(httpStatus.OK)
    .then(r => r.body.token)

  const me = await req(app)
    .post('/graphql')
    .set('Authorization', token)
    .send({
      'query': 'query { me { id, name, email } }'
    })
    .expect(httpStatus.OK)
    .then(r => r.body.data.me)

  validate(me, {
    id: Joi.string().required(),
    name: Joi.string().required(),
    email: Joi.string().email().required(),
    password: Joi.string().forbidden()
  })

  await user.remove()

  t.pass()
})

test('update own user info', async t => {
  const user = await UserHelper.generateUser()

  const token = await req(app)
    .post('/auth/login')
    .send({
      email: user.email,
      password: testPassword
    })
    .expect(httpStatus.OK)
    .then(r => r.body.token)

  const res = await req(app)
    .post('/graphql')
    .set('Authorization', token)
    .send({
      'query': 'mutation { updateUser { name: "test" } }'
    })
    .expect(httpStatus.OK)

  const me = await req(app)
    .post('/graphql')
    .set('Authorization', token)
    .send({
      'query': 'query { me { name } }'
    })
    .expect(httpStatus.OK)
    .then(r => r.body.data.me)

  // TODO user login helper

  validate(me, {
    name: Joi.string().required().equal('test')
  })

  await user.remove()

  t.pass()
})
//#endregion

// TODO register.test.js: register/verify/forgot/reset

// TODO user.admin.test.js
