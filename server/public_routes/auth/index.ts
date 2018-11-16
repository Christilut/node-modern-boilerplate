const router = require('express-promise-router')()
import * as authController from 'server/controllers/auth.controller'
import * as validations from './validation'
import { validationMiddleware } from 'server/helpers/validation'

router.route('/login')
  .post(validationMiddleware(validations.login), authController.login)

router.route('/register')
  .post(validationMiddleware(validations.register), authController.register)

router.route('/verify')
  .post(validationMiddleware(validations.verify), authController.verifyAccount)

router.route('/resend-verification')
  .post(validationMiddleware(validations.resendVerification), authController.resendVerification)

router.route('/forgot-password')
  .post(validationMiddleware(validations.sendForgotPasswordMail), authController.sendForgotPasswordMail)

router.route('/reset-password')
  .post(validationMiddleware(validations.resetPassword), authController.resetPassword)

export default router
