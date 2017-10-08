const validate = require('express-validation')
const paramValidation = require('./validation')
const adminController = require('server/controllers/admin.controller')

const router = require('express-promise-router')() // eslint-disable-line new-cap

router.route('/')
  /** GET /api/v1/admin/users - Get list of users */
  .get(adminController.userGetAll)

  /** POST /api/v1/admin/users - Create new user */
  .post(validate(paramValidation.create), adminController.userCreate)

router.route('/:userId')
  /** GET /api/v1/admin/users/:userId - Get user */
  .get(adminController.userGet)

  /** PATCH /api/v1/admin/users/:userId - Update user */
  .patch(validate(paramValidation.update), adminController.userUpdate)

  /** DELETE /api/v1/admin/users/:userId - Delete user */
  .delete(adminController.userRemove)

/** Load user when API with userId route parameter is hit */
router.param('userId', adminController.userLoad)

module.exports = router
