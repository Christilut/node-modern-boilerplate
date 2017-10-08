const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const EmailHelper = require('../helpers/email')

const ROLES = {
  ADMIN: 'admin'
}

/**
 * User Schema
 */
const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
    index: true,
    unique: true
  },
  created: { // generated in pre-save
    type: Date,
    default: null
  },
  password: {
    type: String,
    required: true
  },
  roles: [
    {
      type: String,
      enum: Object.values(ROLES),
      required: true,
      default: []
    }
  ]
})

/**
 * Add your
 * - pre-save hooks
 * - validations
 * - virtuals
 */
// Pre-save of user to database, hash password if password is modified or new
UserSchema.pre('save', function (next) {
  const user = this
  const SALT_FACTOR = 5

  if (user.isNew) {
    user.created = new Date()
  }

  if (!user.isModified('password')) return next()

  bcrypt.genSalt(SALT_FACTOR, function (err, salt) {
    if (err) return next(err)

    bcrypt.hash(user.password, salt, function (err, hash) {
      if (err) return next(err)

      user.password = hash

      next()
    })
  })
})

/**
 * Methods
 */
UserSchema.method({
  // Method to compare password for login
  async comparePassword (candidatePassword) {
    if (!this.password) throw new Error('User does not have password')

    const isMatch = await bcrypt.compare(candidatePassword, this.password)

    return isMatch
  },

  async sendMail ({ subject, text, templateName, templateData }) {
    await EmailHelper.sendMail({
      to: this.email,
      subject,
      text,
      templateName,
      templateData
    })
  }
})

/**
 * Statics
 */
UserSchema.statics = {
  async findByEmail (email) {
    return this.findOne({ email })
  },

  async exists (id) {
    return !!(await this.findOne({ _id: id }))
  },

  async existsByEmail (email) {
    return !!(await this.findOne({ email }))
  },

  async removeById (id) {
    return this.remove({ _id: id })
  }
}

/**
 * @typedef User
 */
module.exports = {
  User: mongoose.model('User', UserSchema),
  ROLES
}
