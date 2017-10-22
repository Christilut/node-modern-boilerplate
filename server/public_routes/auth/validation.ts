import * as Joi from 'joi'
import { IUpsertUserArgs } from 'server/models/user/mutations'
import { addUserValidation } from 'server/models/user/mutations'

export const login = {
  body: {
    email: Joi.string().required(),
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
