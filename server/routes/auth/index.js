const validate = require('express-validation')
const paramValidation = require('./validation')
const authController = require('server/controllers/auth.controller')
const passport = require('passport')

const router = require('express-promise-router')() // eslint-disable-line new-cap

const requireLogin = passport.authenticate('local', { session: false })

/** POST /api/v1/auth/login - Returns token if correct email and password is provided */
router.route('/login')
  .post(validate(paramValidation.login), requireLogin, authController.login)

/** POST /api/v1/auth/register - Register a new user */
router.route('/register')
  .post(validate(paramValidation.register), authController.register)

module.exports = router
