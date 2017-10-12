import 'reflect-metadata'
import { Connection, ConnectionOptions, createConnection } from 'typeorm'
import { User } from 'server/models/user.model'
import env from 'config/env'

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

  console.log('Inserting a new user into the database...')

  const user = new User()

  user.name = 'Jan Klap'
  user.email = 'test@test.com'
  user.password = 'wachtwoord'

  await connection.manager.save(user)

  console.log('Saved a new user with id: ' + user.id)

  console.log('Loading users from the database...')

  const users = await connection.manager.find(User)

  console.log('Loaded users: ', users)

  console.log('Here you can setup and run express/koa/any other framework.')
}
