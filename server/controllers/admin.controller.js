const User = require('../models/user.model').User
const APIError = require('../helpers/APIError')

/*
* User functions
*/
async function userLoad (req, res, next, id) {
  try {
    const user = await User.findById(id) // dont use get, we want inactive too

    if (!user) return next(new APIError('Not Found', httpStatus.NOT_FOUND))

    req.user = user

    return next()
  } catch (error) {
    if (error.name === 'CastError') return next(new APIError('Not Found', httpStatus.NOT_FOUND, true))

    next(error)
  }
}

async function userGet (req, res, next) {
  res.json(req.user)
}

async function userGetAll (req, res, next) {
  try {
    const users = await User.find()

    return res.json(users)
  } catch (error) {
    next(error)
  }
}

async function userCreate (req, res, next) {
  const { name, email, password } = req.body

  const user = new User({
    name,
    email,
    password,
    verified: true, // dont ask user to verify email
    welcomeMailSent: true // dont send email automatically. Maybe add the call here but for now, no welcome mail
  })

  const userExists = await User.existsByEmail(email)

  if (userExists) return next(new APIError('Email already exists', httpStatus.BAD_REQUEST, true))

  user.save()
    .then(savedUser => {
      res.json(savedUser)
    })
    .catch(e => next(e))
}

async function userUpdate (req, res, next) {
  const user = req.user

  // Add all prop that are allowed to be changed here
  if (req.body.email) user.email = req.body.email
  if (req.body.password) user.password = req.body.password
  if (req.body.name) user.name = req.body.name

  user.save()
    .then(savedUser => {
      res.json(savedUser)
    })
    .catch(e => next(e))
}

async function userRemove (req, res, next) {
  const user = req.user

  try {
    const removedUser = await User.removeById(user._id)

    res.json(removedUser)
  } catch (e) {
    next(e)
  }
}

module.exports = {
  userLoad,
  userGet,
  userGetAll,
  userCreate,
  userUpdate,
  userRemove
}
