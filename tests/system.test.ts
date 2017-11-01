// Set base module path so imports resolve
require('app-module-path').addPath(__dirname + '/..')

// Import libraries needed for testing
import test from 'ava'
import * as Joi from 'joi'
import validate from './helpers/validation'
import { ValidationError, ExtendableError } from 'server/helpers/error'

test('should not throw validation errors', async (t) => {
  const obj = {
    foo: 'bar'
  }

  const validationErrors = validate(obj, {
    foo: Joi.string().required()
  })

  t.true(validationErrors.error === null)

  t.pass()
})

test('should throw validation error because of missing property', async (t) => {
  const obj = {
    foo: 'bar'
  }

  t.throws(() => {
    validate(obj, {
      foo: Joi.string().required(),
      test: Joi.string().required()
    })
  }, ExtendableError)

  t.pass()
})

test('should throw validation error because of null args', async (t) => {
  t.throws(() => {
    validate(null, {
      foo: Joi.string().required()
    })
  }, ExtendableError)

  t.throws(() => {
    validate(undefined, {
      foo: Joi.string().required()
    })
  }, ExtendableError)

  t.throws(() => {
    validate('', {
      foo: Joi.string().required()
    })
  }, ExtendableError)

  t.pass()
})

test('should throw validation error because of extra unexpected property', async (t) => {
  const obj = {
    foo: 'bar',
    test: 123
  }

  t.throws(() => {
    validate(obj, {
      foo: Joi.string().required()
    })
  }, ExtendableError)

  t.pass()
})
