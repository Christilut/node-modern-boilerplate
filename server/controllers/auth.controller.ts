import env from 'config/env'
import * as httpStatus from 'http-status'
import { User, UserType } from 'server/models/user/model'
import * as JWT from 'jsonwebtoken'
import APIError from 'server/helpers/APIError'
const passport = require('passport')
const jwt = require('jsonwebtoken')
const JwtStrategy = require('passport-jwt').Strategy
const ExtractJwt = require('passport-jwt').ExtractJwt
const LocalStrategy = require('passport-local')

export interface IJsonWebTokenContents {
  id: string,
  roles: string[]
}

// const ROLES = require('../models/user.model').ROLES

// const localOptions = { usernameField: 'email', passReqToCallback: true }
// const jwtOptions = {
//   jwtFromRequest: ExtractJwt.fromAuthHeaderWithScheme('jwt'),
//   secretOrKey: config.JWT_SECRET
// }

// const _localLogin = new LocalStrategy(localOptions, async function (req, email, password, next) {
//   let user = null
//   email = email.toLowerCase()

//   try {
//     user = await User.findByEmail(email)
//   } catch (err) {
//     return next(new APIError(err.message, httpStatus.UNAUTHORIZED), false)
//   }

//   if (!user) {
//     return next(null, false, { error: 'Your login details could not be verified. Please try again.' })
//   }

//   let isMatch = false
//   try {
//     isMatch = await user.comparePassword(password)
//   } catch (err) {
//     return next(err)
//   }

//   if (!isMatch) {
//     return next(null, false, { error: 'Your login details could not be verified. Please try again.' })
//   }

//   // Login succes
//   return next(null, user)
// })

// const _jwtLogin = new JwtStrategy(jwtOptions, function (payload, next) {
//   User.findById(payload._id, function (err, user) { // TODO this can be removed when JWT blacklisting is in
//     if (err) { return next(err, false) }

//     if (user) {
//       next(null, user)
//     } else {
//       next(null, false)
//     }
//   })
// })

// passport.use(_jwtLogin)
// passport.use(_localLogin)

export async function checkAuthentication(req, res, next) {
  const token: string = req.headers.authorization

  const decodedToken = await JWT.verify(token, env.JWT_SECRET) as IJsonWebTokenContents

  req.user = {
    id: decodedToken.id,
    roles: decodedToken.roles
  }

  next()
}

export async function checkAdminRole(req, res, next) {
  if (req.user && req.user.roles && req.user.roles.includes('admin')) {
    return next()
  }

  next(new APIError('admin role not found', httpStatus.FORBIDDEN, false))
}

/**
 * Returns User when succesfully registered
 * @param req
 * @param res
 * @param next
 * @returns {*}
 */
export async function register(req, res, next) {
  const { name, email, password } = req.body

  const existingUser = await User.findByEmail(email)

  // If user is not unique, return error
  if (existingUser) {
    const error = new APIError('Email address is already in use', httpStatus.CONFLICT, true)

    return next(error)
  }

  // If email is unique and password was provided, create account
  let user = new User({
    name,
    email,
    password // this is a hash, see user.pre-save
  })

  if (env.NODE_ENV === 'test') {
    if (email === 'admin@admin.admin') {
      // user.roles.push(ROLES.ADMIN) // TODO
    }
  }

  try {
    user = await user.save()

    res.json({
      token: generateToken(user),
      user: setUserInfo(user)
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

  const user: UserType = await User.findOne({
    email
  })

  if (!user || !await user.comparePassword(password)) { // TODO fix no-floating-promises linting, maybe TSLINT vnext?
    throw new Error('Access denied')
  }

  const token = generateToken(user)

  res.json({
    token
  })
}

/*
* Generates a Json Web Token
*/
function generateToken(user: UserType): string {
  // Only add essential information to the JWT
  const jwtUser: IJsonWebTokenContents = {
    id: user.id,
    roles: user.roles
  }

  return jwt.sign(jwtUser, env.JWT_SECRET, {
    expiresIn: '7d'
  })
}

/**
 * Returns sanitized user object that is safe for sending to the user
 * @param {*} user
 */
function setUserInfo(user: UserType) {
  return { // TODO interfacea
    _id: user._id,
    name: user.name,
    email: user.email,
    roles: user.roles
    // dont expose password hash or other sensitive/unnecesary data
  }
}

// function getLoggedInUser (req, res) {
//   const userInfo = setUserInfo(req.user)

//   res.json(userInfo)
// }

// /**
//  * Middleware to check for Admin role
//  */
// async function checkAdminRole (req, res, next) {
//   if (req.user.roles.includes(ROLES.ADMIN)) {
//     return next()
//   }

//   return next(new APIError('User does not have required Admin role', httpStatus.UNAUTHORIZED))
// }
