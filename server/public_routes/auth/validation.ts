import * as Joi from 'joi'
import { IAddUserArgs, addUserValidation } from 'server/models/user/mutations'

export const login = {
  body: {
    email: Joi.string().required(), // should have been validated during registration so dont do it again, incase results change
    password: Joi.string().required()
  }
}

export const register = {
  body: addUserValidation
}

export const verify = {
  body: {
    token: Joi.string().required()
  }
}

export const resendVerification = {
  body: {
    email: Joi.string().email().required()
  }
}

export const sendForgotPasswordMail = {
  body: {
    email: Joi.string().email().required()
  }
}

export const resetPassword = {
  body: {
    token: Joi.string().required(),
    password: addUserValidation.password
  }
}
