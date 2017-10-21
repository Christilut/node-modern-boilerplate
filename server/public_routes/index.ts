import rateLimiter from 'server/system/ratelimiter'

const router = require('express-promise-router')()

// mount misc routes at /api/v1/misc
import miscRoutes from './misc'
router.use('/misc', rateLimiter.middleware(), miscRoutes)

// mount login route at /login
import authRoutes from './auth'
router.use('/auth', rateLimiter.middleware(), authRoutes)

export default router
