import * as Joi from 'joi'

export default function validate(args, schema) {
  const validationErrors = Joi.validate(args, Joi.object(schema).unknown(false))

  if (validationErrors.error) {
    throw new Error(validationErrors.error.message)
  }
}
