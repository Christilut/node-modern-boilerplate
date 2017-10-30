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
import { testPassword, TestUser } from './helpers/user'
import validate from './helpers/validation'
import * as faker from 'faker'

test.skip('', async t => { })
