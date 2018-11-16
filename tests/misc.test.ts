// Set base module path so imports resolve
require('app-module-path').addPath(__dirname + '/..')

// Import libraries needed for testing
import test from 'ava'
import { get } from './helpers/request'

test('misc - health-check endpoint should return OK', async t => {
  await get('/misc/health-check')

  t.pass()
})
