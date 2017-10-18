import { Entity, PrimaryGeneratedColumn, Column, BaseEntity } from 'typeorm'
import * as bcrypt from 'bcrypt'
import { sendMail, EMAIL_TEMPLATES } from 'server/helpers/email'
import { IsEmail, IsIn, ArrayUnique, ArrayNotEmpty } from 'class-validator'
import { validate, ValidationError } from 'class-validator'

export enum Roles {
  User = 'user',
  Admin = 'admin'
}

@Entity()
export class User extends BaseEntity {

  // Id
  @PrimaryGeneratedColumn('uuid')
  id: string

  // Name
  @Column()
  name: string

  // Date created
  @Column({
    default: new Date()
  })
  created: Date

  // Roles
  @IsIn(Object.values(Roles), {
    each: true
  })
  @ArrayUnique()
  @ArrayNotEmpty()
  @Column({
    type: 'simple-array',
    default: Roles.User
  })
  roles: string[]

  // Email
  @IsEmail()
  @Column({
    unique: true,
    name: 'email'
  })
  private _email: string
  get email() { return this._email }
  set email(email: string) {
    this._email = email.toLowerCase()
  }

  // Password hash
  @Column({ name: 'password' })
  private _password: string
  set password(password: string) {
    const SALT_FACTOR = 5

    bcrypt.genSalt(SALT_FACTOR, (err, salt) => {
      if (err) throw err

      bcrypt.hash(password, salt, (err, hash) => {
        if (err) throw err

        this._password = hash
      })
    })
  }

  /**
   * METHODS
   */

  /**
   * Compares given password with stored password hash
   */
  async comparePassword(candidatePassword: string): Promise<boolean> {
    if (!this.password) throw new Error('User does not have password')

    const isMatch = await bcrypt.compare(candidatePassword, this.password)

    return isMatch
  }

  /**
   * Send email to user based on template and data object
   */
  async sendMail(subject: string, text: string, templateName: EMAIL_TEMPLATES, templateData: Object): Promise<void> {
    await sendMail(
      this.email,
      subject,
      text,
      templateName,
      templateData
    )
  }

  /**
   * Performs model validation, pre-save events and saves the user to the database
   */
  async save(): Promise<this> {
    const validationErrors: ValidationError[] = await validate(this)

    if (validationErrors.length > 0) {
      throw new Error('User model validation failed: ' + Object.values(validationErrors[0].constraints).join(', '))
    }

    super.save()

    return this
  }
}
