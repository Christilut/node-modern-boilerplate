require('app-module-path').addPath(__dirname + '/..')

import('config/mongoose')
import test from 'ava'
import * as httpStatus from 'http-status'
import app from 'config/express'
import * as req from 'supertest'

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

//todo user must exist
test('forbidden error when password is wrong', async t => {
  await req(app)
    .post('/auth/login')
    .send({
      email: 'test@test.com',
      password: 'test'
    })
    .expect(httpStatus.FORBIDDEN)

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

//#endregion

//#region User read & update self

//#endregion


// TODO register.test.js: register/verify/forgot/reset

// TODO user.admin.test.js
