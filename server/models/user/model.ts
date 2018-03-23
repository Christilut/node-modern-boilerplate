import env from 'config/env'
import * as bcrypt from 'bcrypt'
import * as mongoose from 'mongoose'
import { sendMail, EMAIL_TEMPLATES } from 'server/helpers/email'
import * as authController from 'server/controllers/auth.controller'
import { prop, arrayProp, Typegoose, InstanceType, staticMethod, instanceMethod, pre } from 'typegoose'

export enum Roles {
  User = 'user',
  Admin = 'admin'
}

@pre<User>('save', async function (next) {
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

export class User extends Typegoose {
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

  @prop()
  created: Date // Set in pre-save

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
  static async get(id: String): Promise<InstanceType<User>> {
    const user: InstanceType<User> = await UserModel.findById(id)

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

    const isMatch = await bcrypt.compare(candidatePassword, this.password)

    return isMatch
  }

  /**
   * Send email to user based on template and data object
   */
  @instanceMethod
  async sendMail(subject: string, text: string, templateName: EMAIL_TEMPLATES, templateData: Object): Promise<void> {
    await sendMail({
      to: this.email,
      from: env.EMAIL_FROM_ADDRESS,
      subject,
      text,
      templateName,
      templateData
    })
  }

  /**
   * Sends email with link to verify user
   */
  @instanceMethod
  async sendVerificationMail() {
    return authController.sendVerificationMail(this)
  }
}

export const UserModel = new User().getModelForClass(User)
