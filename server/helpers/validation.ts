import * as Joi from 'joi'
import { ValidationError } from 'server/helpers/APIError'

export default function validate(args, schema) {
  const validationErrors = Joi.validate(args, Joi.object(schema).unknown(false))

  if (validationErrors.error) {
    throw new ValidationError(validationErrors.error.message)
  }
}
