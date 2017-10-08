const router = require('express-promise-router')() // eslint-disable-line new-cap

/** GET /api/v1/misc/health-check - Check service health */
router.route('/health-check')
  .get((req, res) => res.sendStatus(httpStatus.OK))

if (config.NODE_ENV === 'development') {
  router.route('/will-throw-error')
    .get((req, res) => {
      throw new Error('test error')
    })
}

module.exports = router
