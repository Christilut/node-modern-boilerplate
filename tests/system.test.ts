// Set base module path so imports resolve
require('app-module-path').addPath(__dirname + '/..')

// Import libraries needed for testing
import test from 'ava'
import * as Joi from 'joi'
import testValidator from './helpers/validation'
import { ValidationError, ExtendableError } from 'server/helpers/error'
import { validate as validatorHelper } from 'server/helpers/validation'

test('should not throw validation errors', async (t) => {
  const obj = {
    foo: 'bar'
  }

  const validationErrors = testValidator(obj, {
    foo: Joi.string().required()
  })

  t.true(validationErrors.error === null)

  t.pass()
})

test('should throw validation error because of missing property', async (t) => {
  const obj = {
    foo: 'bar'
  }

  try {
    testValidator(obj, {
      foo: Joi.string().required(),
      test: Joi.string().required()
    })
    t.fail()
  } catch {
    t.pass()
  }
})

test('should throw validation error because of null args', async (t) => {
  try {
    testValidator(null, {
      foo: Joi.string().required()
    })
    t.fail()
  } catch {
    t.pass()
  }

  try {
    testValidator(undefined, {
      foo: Joi.string().required()
    })
    t.fail()
  } catch {
    t.pass()
  }

  try {
    testValidator('', {
      foo: Joi.string().required()
    })
    t.fail()
  } catch {
    t.pass()
  }
})

test('should throw validation error because of extra unexpected property', async (t) => {
  const obj = {
    foo: 'bar',
    test: 123
  }

  try {
    testValidator(obj, {
      foo: Joi.string().required()
    })

    t.fail()
  } catch {
    t.pass()
  }

})

test('should throw validation error because of wrong property type', async (t) => {
  const obj = {
    foo: 'bar'
  }

  try {
    validatorHelper(obj, {
      foo: Joi.string().required(),
      test: Joi.string().required()
    })

    t.fail()
  } catch (error) {
    t.pass()
  }
})
