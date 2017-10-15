import { Entity, PrimaryGeneratedColumn, Column, BaseEntity } from 'typeorm'
import bcrypt from 'bcrypt'
import { sendMail, EMAIL_TEMPLATES } from 'server/helpers/email'
import { IsEmail, IsIn, ArrayUnique, ArrayNotEmpty } from 'class-validator'
import { validate, ValidationError } from 'class-validator'

export enum Roles {
  User = 'user',
  Admin = 'admin'
}

@Entity()
export class User extends BaseEntity {

  @PrimaryGeneratedColumn('uuid')
  id: number

  @Column()
  name: string

  @IsEmail()
  @Column({
    unique: true
  })
  email: string

  @Column({
    default: new Date()
  })
  created: Date

  @Column()
  password: string

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

  /**
   * Compares given password with stored password hash
   */
  async comparePassword(candidatePassword: string): Promise<void> {
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

    // TODO pre-save for password hash

    super.save()

    return this
  }
}
