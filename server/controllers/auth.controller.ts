import env from 'config/env'
import logger from 'config/logger'
import * as httpStatus from 'http-status'
import { User, UserModel, Roles } from 'server/models/user/model'
import * as JWT from 'jsonwebtoken'
import { APIError } from 'server/helpers/error'
import { EMAIL_TEMPLATES } from 'server/helpers/email'
import { sendVerificationMail, IVerificationMailTokenContents, createUser } from 'server/helpers/auth'

export interface IJsonWebTokenContents {
  id: string,
  roles: Roles[]
}

interface IUserInfo {
  id: string
  email: string
  roles: Roles[]
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

  try {
    const verifiedToken = await JWT.verify(token.replace('Bearer ', ''), env.JWT_SECRET) as IJsonWebTokenContents

    const user = await UserModel.findById(verifiedToken.id) as User

    if (!user._active) return next(new APIError('user inactive', httpStatus.FORBIDDEN))

    req.user = user

    next()
  } catch (error) {
    return next(new APIError('invalid token', httpStatus.UNAUTHORIZED))
  }
}

/**
 * Registers a new user and returns JWT & User when succesfully registered
 */
export async function register(req, res, next) {
  const { email } = req.body

  try {
    const user = await createUser({
      email
    })

    return res.json({
      token: _generateToken(user),
      user: _setUserInfo(user)
    })
  } catch (error) {
    res.sendStatus(error.status)
  }
}

/**
 * Returns passport login response (jwt) when valid username and password is provided
 */
export async function login(req, res): Promise<void> {
  const { email, password } = req.body

  const user = await UserModel.findByEmail(email)

  if (!user || !user.password || !await user.comparePassword(password)) {
    logger.info('user access denied: invalid user or password', {
      email,
      headers: req.headers
    })

    throw new APIError('Access denied', httpStatus.FORBIDDEN)
  }

  if (!user._active) {
    logger.info('user access denied: inactive', {
      email,
      headers: req.headers
    })

    throw new APIError('Account not active', httpStatus.UNAUTHORIZED)
  }

  if (!user.verified && env.NODE_ENV !== env.Environments.Test) { // Skip for tests since verifying requires opening an email
    logger.info('user access denied: not verified', {
      email,
      headers: req.headers
    })

    throw new APIError('Access denied', httpStatus.PRECONDITION_FAILED)
  }

  const token = _generateToken(user)

  res.json({
    token
  })

  logger.info('user logged in', {
    email,
    headers: req.headers
  })
}

/**
 * If token valid, will verify user account of the user ID that is inside the JWT. Token should come from a verification email sent to the user (see User.sendVerificationmail).
 */
export async function verifyAccount(req, res, next) {
  const { token, password } = req.body

  try {
    const verifiedToken: IVerificationMailTokenContents = await JWT.verify(token, env.EMAIL_VERIFY_SECRET) as IVerificationMailTokenContents

    const user = await UserModel.findById(verifiedToken.id)

    if (!user) {
      logger.warn('account verification triggered for non-existant user but token was valid', {
        userId: verifiedToken.id,
        headers: req.headers
      })

      return next(new APIError('User does not exist', httpStatus.UNAUTHORIZED))
    }

    if (user.verified) {
      logger.warn('user account verification triggered for already verified user', {
        userId: verifiedToken.id,
        headers: req.headers
      })

      return next(new APIError('User already verified', httpStatus.UNAUTHORIZED))
    }

    user.verified = true
    user.password = password

    await user.save()

    return res.sendStatus(httpStatus.OK)
  } catch (error) {
    logger.warn('invalid JWT was used for account verification', {
      token,
      headers: req.headers
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

  const user = await UserModel.findByEmail(email)

  if (!user) {
    logger.warn('user resend verification mail triggered for non-existant user', {
      email,
      headers: req.headers
    })

    return next(new APIError('User does not exist', httpStatus.UNAUTHORIZED))
  }

  if (user.verified) {
    logger.warn('user resend verification mail triggered for already verified user', {
      email,
      headers: req.headers
    })

    return next(new APIError('User already verified', httpStatus.UNAUTHORIZED))
  }

  logger.info('re-sent account verification mail', {
    email,
    headers: req.headers
  })

  await sendVerificationMail(user)

  res.sendStatus(httpStatus.OK)
}

/**
 * Requests a "forgot password" email that contains a link to reset the password
 */
export async function sendForgotPasswordMail(req, res, next) {
  const email: string = req.body.email

  const user = await UserModel.findByEmail(email)

  if (!user) {
    logger.warn('user forgot password triggered for non-existant user', {
      email,
      headers: req.headers
    })

    return res.sendStatus(httpStatus.OK) // Dont error on invalid email as it exposes which emails have accounts here
  }

  const token: string = await JWT.sign({
    id: user._id
  } as IForgotPasswordTokenContents, env.EMAIL_FORGOT_SECRET,
    {
      expiresIn: '1 day' // 1 day
    })

  await user.sendMail(
    'Change password',
    ``,
    EMAIL_TEMPLATES.Action,
    {
      title: 'Change password',
      firstMessage: ``,
      buttonText: '',
      buttonUrl: ``
    }
  )

  logger.info('sent forgot password email', {
    email,
    headers: req.headers
  })

  res.sendStatus(httpStatus.OK)
}

/**
 * Resets a user password. If the token is valid, takes the user ID from inside the JWT and changes that user to the new password.
 */
export async function resetPassword(req, res, next) {
  const token: string = req.body.token
  const password: string = req.body.password

  try {
    const verifiedToken: IForgotPasswordTokenContents = await JWT.verify(token, env.EMAIL_FORGOT_SECRET) as IForgotPasswordTokenContents

    const user = await UserModel.findById(verifiedToken.id)

    if (!user) {
      logger.warn('reset password triggered for non-existant user but token was valid', {
        verifiedJwt: verifiedToken,
        headers: req.headers
      })

      return next(new APIError('User does not exist', httpStatus.UNAUTHORIZED))
    }

    user.password = password

    await user.save()

    const title = 'Password changed'
    const message = ``

    await user.sendMail(
      title,
      message,
      EMAIL_TEMPLATES.Info,
      {
        message
      }
    )

    logger.info('sent forgot password email', {
      token,
      headers: req.headers
    })

    return res.sendStatus(httpStatus.OK)
  } catch (error) {
    logger.warn('invalid JWT was used for password reset', {
      headers: req.headers
    })

    if (error.name === 'TokenExpiredError') {
      return res.sendStatus(httpStatus.PRECONDITION_FAILED)
    }

    return next(new APIError(error, httpStatus.BAD_REQUEST, false))
  }
}
