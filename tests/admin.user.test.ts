require('app-module-path').addPath(__dirname + '/..')

import('tests/helpers/mockgoose')
import test from 'ava'
import * as httpStatus from 'http-status'
import * as app from 'config/express'
import * as req from 'supertest'
import * as Joi from 'joi'
import { testPassword, TestUser } from './helpers/user'
import validate from './helpers/validation'
import * as faker from 'faker'

test.skip('', async t => {

})
