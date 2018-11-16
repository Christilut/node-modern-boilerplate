import * as Joi from 'joi'
import * as httpStatus from 'http-status'
import { ValidationError } from 'server/helpers/error'

export const joiOptionalString = Joi.string().optional().allow(['', null]) as any
export const joiIsoDate = Joi.date().iso().allow(['', null]) as any

export function validate(args, schema) {
  const validationResult = Joi.validate(args, Joi.object(schema).unknown(true))

  if (validationResult.error) {
    throw new ValidationError(validationResult.error.message)
  }
}

export function validationMiddleware(schema) {
  return function _validationMiddleware(req, res, next) {
    const validationResult = Joi.validate(req, Joi.object(schema).unknown(true))

    if (validationResult.error) throw new ValidationError('Validation failed: ' + validationResult.error.message, httpStatus.BAD_REQUEST, true)

    next()
  }
}
