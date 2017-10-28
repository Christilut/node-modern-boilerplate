import * as Joi from 'joi'

export default function validate(value, schema, message) {
  const validationErrors = Joi.validate(value, schema)

  if (validationErrors.error !== null) return message
  else return true
}
