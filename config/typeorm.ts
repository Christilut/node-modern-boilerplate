import 'reflect-metadata'
import { Connection, ConnectionOptions, createConnection } from 'typeorm'
import { User, Roles } from 'server/models/user.model'
import env from 'config/env'
import { validate } from 'class-validator'

const options: ConnectionOptions = {
  type: 'postgres',
  host: env.DATABASE_HOST,
  port: env.DATABASE_PORT,
  username: env.DATABASE_USERNAME,
  password: env.DATABASE_PASSWORD,
  database: env.DATABASE_NAME,
  synchronize: true,
  logging: false,
  ssl: true,
  entities: [
    'server/models/*'
  ]
}

export async function init () {
  const connection: Connection = await createConnection(options)

  // TODO temp for testing
  const user = await User.findOne({
    email: 'test@test.com'
  })

  user.email = 'test'

  const errors = await validate(user) // TODO do this in pre-save

  if (errors.length > 0) {
    return console.log(errors)
  }

  await user.save()

  console.log('Loaded users: ', user)

  // TODO dont load express until init complete
}
