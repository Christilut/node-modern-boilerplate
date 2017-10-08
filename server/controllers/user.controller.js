const User = require('../models/user.model').User
const setUserInfo = require('./auth.controller').setUserInfo
// const APIError = require('../helpers/APIError')

/**
 * Load user and append to req.
 */
function load (req, res, next, id) {
  User.get(id)
    .then((user) => {
      req.user = user // eslint-disable-line no-param-reassign
      return next()
    })
    .catch(e => next(e))
}

async function update (req, res, next) {
  const user = req.user

  // Add all prop that are allowed to be changed here
  if (req.body.email) user.email = req.body.email
  if (req.body.password) user.password = req.body.password
  if (req.body.name) user.name = req.body.name

  user.save()
    .then(savedUser => {
      res.json(setUserInfo(savedUser))
    })
    .catch(e => next(e))
}

module.exports = {
  load,
  update
}
