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
  id: String

  // Name
  @Column()
  name: String

  // Email
  @IsEmail()
  @Column({
    unique: true
  })
  email: String

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
  roles: String[]

  // Password hash
  @Column({ name: 'password' })
  private _password: String
  set password(password: String) {
    const SALT_FACTOR = 5

    // TODO confirm that a throw here results in a proper JSON response

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
  async comparePassword(candidatePassword: String): Promise<void> {
    if (!this.password) throw new Error('User does not have password')

    const isMatch = await bcrypt.compare(candidatePassword, this.password)

    return isMatch
  }

  /**
   * Send email to user based on template and data object
   */
  async sendMail(subject: String, text: String, templateName: EMAIL_TEMPLATES, templateData: Object): Promise<void> {
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
