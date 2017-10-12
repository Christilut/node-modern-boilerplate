import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm'
import bcrypt from 'bcrypt'
import { sendMail, EMAIL_TEMPLATES } from 'server/helpers/email'

export enum Roles {
  User = 'user',
  Admin = 'admin'
}

@Entity()
export class User {

  @PrimaryGeneratedColumn('uuid')
  id: number

  @Column()
  name: string

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
    enum: Roles, // TODO test this
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
