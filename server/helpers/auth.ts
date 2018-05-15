import { User, UserModel } from 'server/models/user/model'
import env from 'config/env'
import logger from 'config/logger'
import * as Joi from 'joi'
import { validate } from 'server/helpers/validation'
import { InstanceType } from 'typegoose'
import * as JWT from 'jsonwebtoken'
import { EMAIL_TEMPLATES } from 'server/helpers/email'
import { addUserValidation } from 'server/models/user/mutations'
import { APIError } from 'server/helpers/error'
import * as httpStatus from 'http-status'

export interface ICreateUserArgs {
  name: string
  email: string
  password: string
}

export interface IVerificationMailTokenContents {
  id: string
}

export async function createUser(args: ICreateUserArgs): Promise<InstanceType<User>> {
  validate(args, addUserValidation)

  const existingCustomer: User = await UserModel.findOne({ email: args.email })

  // If user is not unique, return error
  if (existingCustomer) {
    throw new APIError('Email address is already in use', httpStatus.CONFLICT)
  }

  // If email is unique, create account
  let user = new UserModel({
    name: args.name,
    email: args.email,
    password: args.password
  })

  user = await user.save()

  // Verification link is sent in pre-save

  return user
}

export async function sendVerificationMail(user: User) {
  const token = await JWT.sign({ id: user._id } as IVerificationMailTokenContents, env.EMAIL_VERIFY_SECRET, {
    expiresIn: '1 day'
  })

  const verificationLink = env.DOMAIN + `/verify?token=${token}`

  await user.sendMail(
    'Account verification',
    `Please verify your account by clicking the following link: ${verificationLink}`,
    EMAIL_TEMPLATES.Action,
    {
      title: 'Account verification',
      message: 'Please verify your account by clicking the button below.',
      buttonText: 'Verify now',
      buttonUrl: verificationLink
    }
  )
}
