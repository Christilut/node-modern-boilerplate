import { Entity, PrimaryGeneratedColumn, Column, BaseEntity } from 'typeorm'
import bcrypt from 'bcrypt'
import { sendMail, EMAIL_TEMPLATES } from 'server/helpers/email'
import { IsEmail } from 'class-validator'

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

  @IsEmail() // TODO test this
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

  @Column({
    type: 'simple-array',
    enum: Roles, // TODO doesnt work, make custom validator?
    default: Roles.User
  })
  roles: string

  // TODO pre-save for password hash

  async comparePassword (candidatePassword) {
    if (!this.password) throw new Error('User does not have password')

    const isMatch = await bcrypt.compare(candidatePassword, this.password)

    return isMatch
  }

  async sendMail (subject: string, text: string, templateName: EMAIL_TEMPLATES, templateData: Object) {
    await sendMail(
      this.email,
      subject,
      text,
      templateName,
      templateData
    )
  }
}
