const userController = require('server/controllers/user.controller')
const authController = require('server/controllers/auth.controller')
const validate = require('express-validation')
const paramValidation = require('./validation')

const router = require('express-promise-router')() // eslint-disable-line new-cap

router.route('/me')
  /** GET /api/v1/user/me - Get current logged in user ojbect */
  .get(authController.getLoggedInUser)

  /** PUT /api/v1/user/me - Update user details */
  .put(validate(paramValidation.update), userController.update)

module.exports = router
