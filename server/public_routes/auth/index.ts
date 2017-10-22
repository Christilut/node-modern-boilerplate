const router = require('express-promise-router')()
import * as validate from 'express-validation'
import * as authController from 'server/controllers/auth.controller'
import * as validations from './validation'

router.route('/login')
  .post(validate(validations.login), authController.login)

router.route('/register')
  .post(validate(validations.register), authController.register)

router.route('/verify')
  .post(validate(validations.verify), authController.verifyAccount)

router.route('/resend-verification')
  .post(validate(validations.resendVerification), authController.resendVerification)

router.route('/forgot-password')
  .post(validate(validations.sendForgotPasswordMail), authController.sendForgotPasswordMail)

router.route('/reset-password')
  .post(validate(validations.resetPassword), authController.resetPassword)

export default router
