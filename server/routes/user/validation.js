const Joi = require('joi')

module.exports = {
  update: {
    body: {
      name: Joi.string().optional(),
      email: Joi.string().email().optional(),
      password: require('../auth/validation').register.body.password.optional()
    }
  }
}
