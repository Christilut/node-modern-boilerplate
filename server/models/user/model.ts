import env from 'config/env'
import * as bcrypt from 'bcrypt'
import * as mongoose from 'mongoose'
import { sendMail, EMAIL_TEMPLATES } from 'server/helpers/email'
import * as JWT from 'jsonwebtoken'
import * as authController from 'server/controllers/auth.controller'
import { prop, arrayProp, Typegoose, ModelType, InstanceType, staticMethod, instanceMethod, pre } from 'typegoose'

export enum Roles {
  User = 'user',
  Admin = 'admin'
}

@pre<UserClass>('save', async function (next) {
  console.log('pre save !!!') // TODO confirm presave works
  if (this.isNew) {
    this.created = new Date()
  }

  if (this.isModified('password')) {
    const SALT_FACTOR = 10

    const salt: string = await bcrypt.genSalt(SALT_FACTOR)

    const hash: string = await bcrypt.hash(this.password, salt)

    this.password = hash
  }

  next()
})

export class UserClass extends Typegoose {
  _id: string

  @prop({
    required: true
  })
  name: string

  @prop({
    required: true,
    unique: true
  })
  email: string

  @arrayProp({
    items: String,
    required: true,
    default: [Roles.User],
    enum: Roles
  })
  roles?: Roles[]

  @prop({
    required: true
  })
  created: Date // Set in pre-save upon creation

  @prop({
    required: true
  })
  password: string

  @prop({
    default: false
  })
  verified?: boolean

  /**
   * STATIC METHODS
   */
  @staticMethod
  static async get(id: String): Promise<UserClass & mongoose.Document> {
    const user = await User.findById(id)

    if (!user) throw new Error('user not found')

    return user
  }

  /**
   * INSTANCE METHODS
   */

  /**
   * Compares given password with stored password hash
   */
  @instanceMethod
  async comparePassword(candidatePassword: string): Promise<boolean> {
    if (!this.password) throw new Error('User does not have password')

    const isMatch = await bcrypt.compare(candidatePassword, this.password) // TODO test

    return isMatch
  }

  /**
   * Send email to user based on template and data object
   */
  @instanceMethod
  async sendMail(subject: string, text: string, templateName: EMAIL_TEMPLATES, templateData: Object): Promise<void> {
    await sendMail(
      this.email,
      subject,
      text,
      templateName,
      templateData
    )
  }

  @instanceMethod
  async sendVerificationMail() {
    return authController.sendVerificationMail(this._id)
  }

  // TODO model validation
}

export const User = new UserClass().getModelForClass(UserClass)

setTimeout(async () => {
  console.log('saving new user for testing')

  const u = new User({
    name: 'JohnDoe',
    email: 'test@test.test',
    created: new Date(),
    password: 'test123'
  })
  try {
    await u.save()
    // const user = await User.findOne({ name: 'JohnDoe' })
  } catch (error) {
    console.error(error)
  }

  console.log('!!!!!!!!!!!!!!!!!    if it prints this, then it works')
}, 2000)
