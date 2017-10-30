import env from 'config/env'
import logger from 'config/logger'
import * as httpStatus from 'http-status'
import { User, UserModel, Roles } from 'server/models/user/model'
import * as JWT from 'jsonwebtoken'
import { APIError } from 'server/helpers/APIError'
import { addUserValidation } from 'server/models/user/mutations'
import { EMAIL_TEMPLATES } from 'server/helpers/email'

export interface IJsonWebTokenContents {
  id: string,
  roles: Roles[]
}

interface IUserInfo {
  id: string
  name: string
  email: string
  roles: Roles[]
}

interface IVerificationMailTokenContents {
  id: string
}

interface IForgotPasswordTokenContents {
  id: string
}

/*
* Generates a Json Web Token
*/
function _generateToken(user: User): string {
  // Only add essential information to the JWT
  const jwtUser: IJsonWebTokenContents = {
    id: user._id,
    roles: user.roles
  }

  return JWT.sign(jwtUser, env.JWT_SECRET, {
    expiresIn: '7d'
  })
}

/**
 * Returns sanitized user object that is safe for sending to the user
 */
function _setUserInfo(user: User): IUserInfo {
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    roles: user.roles
    // dont expose password hash or other sensitive/unnecesary data
  }
}

/**
 * Verifies JWT and throws error if invalid
 */
export async function checkAuthentication(req, res, next) {
  const token: string = req.headers.authorization

  const decodedToken = await JWT.verify(token, env.JWT_SECRET) as IJsonWebTokenContents

  req.user = {
    id: decodedToken.id,
    roles: decodedToken.roles
  }

  next()
}

/**
 * Checks if user has the admin role will throw an error if not
 */
export async function checkAdminRole(req, res, next) {
  if (req.user && req.user.roles && req.user.roles.includes('admin')) {
    return next()
  }

  next(new APIError('admin role not found', httpStatus.FORBIDDEN, false))
}

/**
 * Registers a new user and returns JWT & User when succesfully registered
 */
export async function register(req, res, next) {
  const name: string = req.body.name
  const email: string = req.body.email
  const password: string = req.body.password

  const existingUser: User = await UserModel.findOne({ email })

  // If user is not unique, return error
  if (existingUser) {
    const error = new APIError('Email address is already in use', httpStatus.CONFLICT, true)

    return next(error)
  }

  // If email is unique and password was provided, create account
  let user = new UserModel({
    name,
    email,
    password // Gets converted to hash in pre-save
  })

  try {
    user = await user.save()

    await user.sendVerificationMail()

    return res.json({
      token: _generateToken(user),
      user: _setUserInfo(user)
    })
  } catch (error) {
    return next(error)
  }
}

/**
 * Returns passport login response (jwt) when valid username and password is provided
 */
export async function login(req, res, next): Promise<void> {
  const { email, password } = req.body

  const user = await UserModel.findOne({
    email
  })

  if (!user || !await user.comparePassword(password)) { // TODO fix no-floating-promises linting, maybe TSLINT vnext?
    throw new APIError('Access denied', httpStatus.FORBIDDEN, true)
  }

  const token = _generateToken(user)

  res.json({
    token
  })
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

/**
 * If token valid, will verify user account of the user ID that is inside the JWT. Token should come from a verification email sent to the user (see User.sendVerificationmail).
 */
export async function verifyAccount(req, res, next) {
  const token: string = req.body.token

  try {
    const decodedToken: IVerificationMailTokenContents = await JWT.verify(token, env.EMAIL_VERIFY_SECRET) as IVerificationMailTokenContents

    const user = await UserModel.findById(decodedToken.id)

    if (!user) {
      logger.warn('account verification triggered for non-existant user but token was valid', {
        userId: decodedToken.id,
        req
      })

      return next(new APIError('User does not exist', httpStatus.UNAUTHORIZED))
    }

    if (user.verified) {
      logger.warn('user account verification triggered for already verified user', {
        userId: decodedToken.id,
        req
      })

      return next(new APIError('User already verified', httpStatus.UNAUTHORIZED))
    }

    user.verified = true

    await user.save()

    return res.sendStatus(httpStatus.OK)
  } catch (error) {
    logger.warn('invalid JWT was used for account verification', {
      token,
      req
    })

    if (error.name === 'TokenExpiredError') {
      return res.sendStatus(httpStatus.PRECONDITION_FAILED)
    }

    return next(new APIError(error, httpStatus.BAD_REQUEST, false))
  }
}

/**
 * Sends the email verification mail again
 */
export async function resendVerification(req, res, next) {
  const email: string = req.body.email

  if (!email) {
    return next(new APIError('Missing email parameter', httpStatus.UNAUTHORIZED))
  }

  const user = await UserModel.findOne({ email })

  if (!user) {
    logger.warn('user resend verification mail triggered for non-existant user', {
      email,
      req
    })

    return next(new APIError('User does not exist', httpStatus.UNAUTHORIZED))
  }

  if (user.verified) {
    logger.warn('user resend verification mail triggered for already verified user', {
      email,
      req
    })

    return next(new APIError('User already verified', httpStatus.UNAUTHORIZED))
  }

  await user.sendVerificationMail()

  res.sendStatus(httpStatus.OK)
}

/**
 * Requests a "forgot password" email that contains a link to reset the password
 */
export async function sendForgotPasswordMail(req, res, next) {
  const email: string = req.body.email

  const user = await UserModel.findOne({ email })

  if (!user) {
    logger.warn('user forgot password triggered for non-existant user', {
      email,
      req
    })

    return res.sendStatus(httpStatus.OK) // Dont error on invalid email as it exposes which emails have accounts here
  }

  const token: string = await JWT.sign({
    id: user._id
  } as IForgotPasswordTokenContents, env.EMAIL_FORGOT_SECRET, {
    expiresIn: '1 day' // 1 day
  })

  await user.sendMail(
    'Password reset instructions',
    `Someone has triggered password reset on your email. You can reset your password at ${env.DOMAIN + '/forgot'}. If you did not expect this email, you can safely ignore it.`,
    EMAIL_TEMPLATES.Action,
    {
      title: 'Forgot password',
      message: 'Someone has triggered password reset on your email. You can reset your password with the button below. If you did not expect this email, you can safely ignore it.',
      buttonText: 'Reset password',
      buttonUrl: env.DOMAIN + `/forgot?token=${token}`
    }
  )

  res.sendStatus(httpStatus.OK)
}

/**
 * Resets a user password. If the token is valid, takes the user ID from inside the JWT and changes that user to the new password.
 */
export async function resetPassword(req, res, next) {
  const token: string = req.body.token
  const password: string = req.body.password

  try {
    const decodedToken: IForgotPasswordTokenContents = await JWT.verify(token, env.EMAIL_FORGOT_SECRET) as IForgotPasswordTokenContents

    const user = await UserModel.findById(decodedToken.id)

    if (!user) {
      logger.warn('reset password triggered for non-existant user but token was valid', {
        decodedJwt: decodedToken,
        req
      })

      return next(new APIError('User does not exist', httpStatus.UNAUTHORIZED))
    }

    user.password = password

    await user.save()

    await user.sendMail(
      'Password changed',
      `Your password has been changed. If this was not you, please reset your password immediately on the login screen and check who can access your email.`,
      EMAIL_TEMPLATES.Info,
      {
        title: 'Password changed',
        lead: 'Your password has been updated successfully.',
        message: 'If you did not do this, please reset your password immediately on the login screen and check who can access your email.'
      }
    )

    return res.sendStatus(httpStatus.OK)
  } catch (error) {
    logger.warn('invalid JWT was used for password reset', {
      req
    })

    if (error.name === 'TokenExpiredError') {
      return res.sendStatus(httpStatus.PRECONDITION_FAILED)
    }

    return next(new APIError(error, httpStatus.BAD_REQUEST, false))
  }
}
