import { User, UserModel } from 'server/models/user/model'
import env from 'config/env'
import logger from 'config/logger'
import * as Joi from 'joi'
import { validate } from 'server/helpers/validation'
import { InstanceType } from 'typegoose'
import * as JWT from 'jsonwebtoken'
import { EMAIL_TEMPLATES } from 'server/helpers/email'
import { APIError } from 'server/helpers/error'
import * as httpStatus from 'http-status'

export interface ICreateUserArgs {
  email: string
}

export interface IVerificationMailTokenContents {
  id: string
}

export const createUserValidation: ICreateUserArgs = {
  email: Joi.string().email().required() as any
}

export async function createUser(args: ICreateUserArgs): Promise<InstanceType<User>> {
  validate(args, createUserValidation)

  const existingUser: User = await UserModel.findByEmail(args.email)

  // If user is not unique, return error
  if (existingUser) {
    throw new APIError('Email address is already in use', httpStatus.CONFLICT)
  }

  // If email is unique, create account
  let user = new UserModel({
    email: args.email.toLowerCase()
  })

  user = await user.save()

  // User has no password yet and must set one in the verification link, sent in the pre-save

  return user
}

export async function sendVerificationMail(user: User) {
  const token = await JWT.sign({ id: user._id } as IVerificationMailTokenContents, env.EMAIL_VERIFY_SECRET, {
    expiresIn: '1 day'
  })

  await user.sendMail(
    'Account activation',
    ``,
    EMAIL_TEMPLATES.Action,
    {
      title: 'Account activation',
      firstMessage: '',
      lastMessage: '',
      buttonText: ''
    }
  )

  logger.info('sent verification mail', {
    email: user.email
  })
}
