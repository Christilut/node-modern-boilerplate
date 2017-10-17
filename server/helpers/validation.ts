import * as Joi from 'joi'

export default function validate(args, schema) {
  const validationErrors = Joi.validate(args, schema)

  if (validationErrors.error) {
    throw new Error(validationErrors.error.message)
  }
}
