// Set base module path so imports resolve
require('app-module-path').addPath(__dirname + '/..')

// Import libraries needed for testing
import test from 'ava'
import env from 'config/env'
import * as mongoose from 'mongoose'
import { UserModel } from 'server/models'
import { generateRandomDatabaseName } from './helpers/mongo'
import { TestUser } from './helpers/user'

test.before(async t => {
  const uri = 'mongodb://localhost/' + generateRandomDatabaseName()

  await mongoose.connect(uri, {
    useNewUrlParser: true
  })
})

test.after.always(async t => {
  await mongoose.connection.db.dropDatabase()
})

test('user - throw error when using comparePassword and user does not have a password', async (t) => {
  const user = new UserModel()

  user.password = ''

  try {
    await user.comparePassword('test')

    t.fail()
  } catch (error) {
    t.pass()
  }
})

// test('user - expect error when trying to update user that does not exist', async (t) => {
//   const user = new UserModel()
//   user._id = '578df3efb618f5141202a196'

//   try {
//     await updateUser(user, {
//       name: faker.name.findName()
//     })

//     t.fail()
//   } catch (error) {
//     t.true(error.message === 'user with id 578df3efb618f5141202a196 not found')
//     t.pass()
//   }
// })
