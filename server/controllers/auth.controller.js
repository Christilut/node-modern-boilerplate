const APIError = require('../helpers/APIError')
const passport = require('passport')
const User = require('../models/user.model').User
const jwt = require('jsonwebtoken')
const JwtStrategy = require('passport-jwt').Strategy
const ExtractJwt = require('passport-jwt').ExtractJwt
const LocalStrategy = require('passport-local')

const ROLES = require('../models/user.model').ROLES

const localOptions = { usernameField: 'email', passReqToCallback: true }
const jwtOptions = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderWithScheme('jwt'),
  secretOrKey: config.JWT_SECRET
}

passport.serializeUser(function (user, done) {
  done(null, user)
})

passport.deserializeUser(function (user, done) {
  done(null, user)
})

const _localLogin = new LocalStrategy(localOptions, async function (req, email, password, next) {
  let user = null
  email = email.toLowerCase()

  try {
    user = await User.findByEmail(email)
  } catch (err) {
    return next(new APIError(err.message, httpStatus.UNAUTHORIZED), false)
  }

  if (!user) {
    return next(null, false, { error: 'Your login details could not be verified. Please try again.' })
  }

  let isMatch = false
  try {
    isMatch = await user.comparePassword(password)
  } catch (err) {
    return next(err)
  }

  if (!isMatch) {
    return next(null, false, { error: 'Your login details could not be verified. Please try again.' })
  }

  // Login succes
  return next(null, user)
})

const _jwtLogin = new JwtStrategy(jwtOptions, function (payload, next) {
  User.findById(payload._id, function (err, user) { // TODO this can be removed when JWT blacklisting is in
    if (err) { return next(err, false) }

    if (user) {
      next(null, user)
    } else {
      next(null, false)
    }
  })
})

passport.use(_jwtLogin)
passport.use(_localLogin)

/**
 * Returns sanitized user object that is safe for sending to the user
 * @param {*} user
 */
function setUserInfo (user) {
  return {
    _id: user._id,
    name: user.name,
    email: user.email,
    roles: user.roles
    // dont expose password hash or other sensitive/unnecesary data
  }
}

function generateToken ({ user }) {
  // remove User details or the JWT will be huge
  const smallUser = {
    _id: user._id,
    email: user.email.toLowerCase()
  }

  return jwt.sign(smallUser, config.JWT_SECRET, {
    expiresIn: 604800
  })
}

/**
 * Returns User when succesfully registered
 * @param req
 * @param res
 * @param next
 * @returns {*}
 */
async function register (req, res, next) {
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

  if (config.NODE_ENV === 'test') {
    if (email === 'admin@admin.admin') {
      user.roles.push(ROLES.ADMIN)
    }
  }

  try {
    user = await user.save()

    res.json({
      token: 'JWT ' + generateToken({ user }),
      user: setUserInfo(user)
    })
  } catch (error) {
    return next(error)
  }
}

/**
 * Returns passport login response (jwt) when valid username and password is provided
 * @param req
 * @param res
 * @returns {*}
 */
function login (req, res) {
  const user = req.user

  res.status(httpStatus.OK).json({
    token: 'JWT ' + generateToken({ user }),
    user: setUserInfo(user)
  })
}

function getLoggedInUser (req, res) {
  const userInfo = setUserInfo(req.user)

  res.json(userInfo)
}

/**
 * Middleware to check for Admin role
 */
async function checkAdminRole (req, res, next) {
  if (req.user.roles.includes(ROLES.ADMIN)) {
    return next()
  }

  return next(new APIError('User does not have required Admin role', httpStatus.UNAUTHORIZED))
}

module.exports = {
  login,
  register,
  setUserInfo,
  getLoggedInUser,
  checkAdminRole
}
