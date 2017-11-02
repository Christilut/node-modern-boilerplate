// Set base module path so imports resolve
require('app-module-path').addPath(__dirname + '/..')

// Init in-memory database
import('tests/helpers/mongo')

// Launch express on random port
import app from 'config/express'

// Import libraries needed for testing
import test from 'ava'
import { testPassword, TestUser } from './helpers/user'
import * as faker from 'faker'
import { User, UserModel } from 'server/models/user/model'
import { updateUser } from 'server/models/user/mutations'

test('throw error when using comparePassword and user does not have a password', async (t) => {
  const user = new UserModel()

  user.password = ''

  try {
    await user.comparePassword('test')

    t.fail()
  } catch (error) {
    t.pass()
  }
})

test('expect error when trying to update user that does not exist', async (t) => {
  try {
    await updateUser('578df3efb618f5141202a196', {
      name: faker.name.findName()
    })

    t.fail()
  } catch (error) {
    t.true(error.message === 'user not found')
    t.pass()
  }
})
