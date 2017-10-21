const router = require('express-promise-router')()
import * as validate from 'express-validation'
import { login, register } from 'server/controllers/auth.controller'
import { addUserValidation } from 'server/models/user/mutations'
import * as validations from './validation'

router.route('/login')
  .post(validate(validations.login), login)

router.route('/register')
  .post(validate(validations.register), register)

export default router
