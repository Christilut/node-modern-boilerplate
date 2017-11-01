import * as Joi from 'joi'
import { ValidationError } from 'server/helpers/error'

export default function validate(args, schema) {
  if (!args) throw new ValidationError('args object is undefined')

  const validationErrors = Joi.validate(args, Joi.object(schema).unknown(false))

  if (validationErrors.error) {
    throw new ValidationError(validationErrors.error.message)
  }

  return validationErrors
}
