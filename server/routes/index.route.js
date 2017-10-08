const passport = require('passport')
const rateLimiter = require('../system/ratelimiter')
const checkAdminRole = require('../controllers/auth.controller').checkAdminRole

const router = require('express-promise-router')() // eslint-disable-line new-cap

const requireAuth = passport.authenticate('jwt', { session: false })

// mount misc routes at /api/v1/misc
router.use('/misc', rateLimiter.apiLimiter.middleware(), require('./misc'))

// mount auth routes at /api/v1/auth
router.use('/auth', rateLimiter.apiLimiter.middleware(), require('./auth'))

// mount user routes at /api/v1/user
router.use('/user', rateLimiter.apiLimiter.middleware(), requireAuth, require('./user'))

// admin routes
router.use('/admin/users', requireAuth, checkAdminRole, require('./admin/user.route'))

module.exports = router
