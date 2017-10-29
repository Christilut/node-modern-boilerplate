require('app-module-path').addPath(__dirname + '/..')

import('tests/helpers/mockgoose')
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

//#region Validation & permission errors
test('validation error when email is not given', async t => {
  await req(app)
    .post('/auth/register')
    .send({
      password: faker.internet.password()
    })
    .expect(httpStatus.BAD_REQUEST)

  t.pass()
})
 //#endregion
