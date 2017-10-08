const Joi = require('joi')

module.exports = {
  // POST /api/v1/admin/users
  create: {
    body: {
      name: Joi.string().required(),
      email: Joi.string().email().required(),
      password: Joi.string().required()
    }
  },

  // UPDATE /api/v1/admin/users/:userId
  update: {
    params: {
      userId: Joi.objectId().required()
    },
    body: {
      name: Joi.string(),
      email: Joi.string().email(),
      password: Joi.string() // not strong password check here, admin can do whatever he wants (user changing his own password does have rules)
    }
  },

  // GET /api/v1/admin/users/email/:email
  getByEmail: {
    params: {
      email: Joi.string().email().required()
    }
  }
}
