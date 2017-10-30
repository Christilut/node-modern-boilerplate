import env from 'config/env'
import * as httpStatus from 'http-status'
const router = require('express-promise-router')()

/** GET /misc/health-check - Check service health */
router.route('/health-check')
  .get((req, res) => res.sendStatus(httpStatus.OK))

if (env.NODE_ENV !== 'production') {
  /** GET /misc/will-throw-error - Dev only: throws error for testing purposes */
  router.route('/will-throw-error')
    .get((req, res) => {
      throw new Error('test error')
    })
}

export default router
