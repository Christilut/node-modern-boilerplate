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

test('create a new user, get details, remove it and confirm it does not exist', async t => {
  const admin = await TestUser.getLoggedInUser(app)
  await admin.addAdminRole()

  const data = await admin.query(`
    mutation {
      addUser(name: "${faker.name.findName()}", email: "${faker.internet.email()}", password: "${testPassword}") {
        id,
        name,
        email
      }
    }`
  )
  console.log(data)
  validate(data.user, {
    id: Joi.string().required(),
    name: Joi.string().required(),
    email: Joi.string().email().required(),
    password: Joi.string().forbidden()
  })

  await admin.cleanup()

  t.pass()
})
