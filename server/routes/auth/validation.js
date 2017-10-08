const Joi = require('joi')

const strongPassword = Joi.string().regex(/^(?=.{8,})(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&+=]).*$/)

module.exports = {
  login: {
    body: {
      email: Joi.string().email().required(),
      password: Joi.string().required()
    }
  },

  register: {
    body: {
      name: Joi.string().required(),
      email: Joi.string().email().required(),
      password: strongPassword // Make sure this is the same in the frontend
    }
  }
}
