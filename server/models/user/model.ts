import env from 'config/env'
import * as bcrypt from 'bcrypt'
import * as mongoose from 'mongoose'
import { sendMail, EMAIL_TEMPLATES } from 'server/helpers/email'
import { AbstractModel, IAbstractModel } from 'config/mongoose'
import { Model, SchemaField, Instance, Static, model, schema } from '@decorators/mongoose'
import * as JWT from 'jsonwebtoken'
import * as authController from 'server/controllers/auth.controller'

export enum Roles {
  User = 'user',
  Admin = 'admin'
}

@Model('User')
export class UserClass extends AbstractModel {

  _id: string

  @SchemaField(String) // TODO required
  name: string

  @SchemaField(String) // TODO required
  email: string

  @SchemaField(Array) // TODO enum, default: []
  roles: string[]

  @SchemaField(Date)
  created: Date // TODO readonly

  @SchemaField(String) // TODO required
  password: string

  @SchemaField(Boolean) // TODO default: false
  verified: boolean

  /**
   * METHODS
   */
  @Static()
  async get(id: String): Promise<UserType> {
    const user: UserType = await User.findById(id)

    if (!user) throw new Error('user not found')

    return user
  }

  /**
   * Compares given password with stored password hash
   */
  @Instance()
  async comparePassword(candidatePassword: string): Promise<boolean> {
    if (!this.password) throw new Error('User does not have password')

    // TODO temp
    const isMatch = candidatePassword === this.password
    // const isMatch = await bcrypt.compare(candidatePassword, this.password)

    return isMatch
  }

  /**
   * Send email to user based on template and data object
   */
  @Instance()
  async sendMail(subject: string, text: string, templateName: EMAIL_TEMPLATES, templateData: Object): Promise<void> {
    await sendMail(
      this.email,
      subject,
      text,
      templateName,
      templateData
    )
  }

  @Instance()
  async sendVerificationMail() {
    return authController.sendVerificationMail(this._id)
  }

  /**
   * Performs model validation, pre-save events and saves the user to the database
   */
  // async save(): Promise<this> {
  //   const validationErrors: ValidationError[] = await validate(this)

  //   if (validationErrors.length > 0) {
  //     throw new Error('User model validation failed: ' + Object.values(validationErrors[0].constraints).join(', '))
  //   }

  //   super.save()

  //   return this
  // }
}

export type UserType = UserClass & mongoose.Document
export type UserModel = mongoose.Model<UserType>

export const User = model<UserType>({ provide: UserClass })
export const UserSchema = schema({ provide: UserClass })

UserSchema.pre('save', async function (next) {
  const SALT_FACTOR = 5
  console.log('pre save !!!') // TODO make presave work
  if (this.isNew) {
    this.created = new Date()
  }

  if (this.isModified('password')) {
    const salt: string = await bcrypt.genSalt(SALT_FACTOR)

    const hash: string = await bcrypt.hash(this.password, salt)

    this.password = hash
  }

  next()
})
