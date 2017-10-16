import 'reflect-metadata'
import { Connection, ConnectionOptions, createConnection } from 'typeorm'
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
    'server/models/user/model.ts'
  ]
}

export async function init() {
  try {
    const connection: Connection = await createConnection(options)
  } catch (error) {
    console.log('Database initialization failed: ' + error.message)
  }
}
