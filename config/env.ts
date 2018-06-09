import * as Joi from 'joi'

export enum Environments {
  Test = 'test',
  Development = 'development',
  Production = 'production'
}

export interface IEnvironmentVariables {
  NODE_ENV?: string
  DEBUG?: boolean
  PORT?: number
  MONGO_HOST?: string
  DOMAIN?: string
  JWT_SECRET?: string
  FOREST_ENV_SECRET?: string
  FOREST_AUTH_SECRET?: string
  MASQUERADE_SECRET?: string
  MAILGUN_API_KEY?: string
  MAILGUN_DOMAIN?: string
  EMAIL_FORGOT_SECRET?: string
  EMAIL_VERIFY_SECRET?: string
  EMAIL_FROM_ADDRESS?: string
  EMAIL_DEV_ADDRESS?: string

  AWS_ACCESS_KEY_ID?: string
  AWS_SECRET_ACCESS_KEY?: string
  AWS_REGION?: string

  AWS_LOG_GROUP?: string
  SENTRY_URL?: string

  Environments: typeof Environments
}

// require and configure dotenv, will load vars in .env in PROCESS.ENV
require('dotenv').config()

// define validation for all the env vars
const allowedEnvKeys: Joi.SchemaMap = {
  NODE_ENV: Joi.string()
    .valid([Environments.Test, Environments.Development, Environments.Production])
    .required(),
  DEBUG: Joi.boolean().optional(),
  PORT: Joi.number().default(5000).required(),
  MONGO_HOST: Joi.string().required(),
  DOMAIN: Joi.string().uri().optional(),
  JWT_SECRET: Joi.string().required(),
  FOREST_ENV_SECRET: Joi.string().allow('').optional(),
  FOREST_AUTH_SECRET: Joi.string().allow('').optional(),
  MAILGUN_API_KEY: Joi.string().allow('').optional(),
  MAILGUN_DOMAIN: Joi.string().allow('').optional(),
  EMAIL_FORGOT_SECRET: Joi.string().required(),
  EMAIL_VERIFY_SECRET: Joi.string().required(),
  MASQUERADE_SECRET: Joi.string().required(),
  EMAIL_FROM_ADDRESS: Joi.string().email().allow('').optional(),
  EMAIL_DEV_ADDRESS: Joi.string().email().allow('').optional(),
  AWS_ACCESS_KEY_ID: Joi.string().required(),
  AWS_SECRET_ACCESS_KEY: Joi.string().required(),
  AWS_REGION: Joi.string().required(),
  SENTRY_URL: Joi.string().uri().allow('').optional(),
  AWS_LOG_GROUP: Joi.string().allow('').optional()
}

let envVarsSchema = Joi.object(allowedEnvKeys).unknown().required()

if (process.env.NODE_ENV === Environments.Production) {
  const envVarsProduction = Joi.object({

  })

  envVarsSchema = envVarsSchema.concat(envVarsProduction)
}

const { error, value: envVars } = Joi.validate(process.env, envVarsSchema)

if (error) {
  throw new Error(`Config validation error: ${error.message}`)
}

const envKeys = Object.keys(allowedEnvKeys)

const config: IEnvironmentVariables = {
  Environments: Environments
}

for (const key of envKeys) {
  config[key] = envVars[key]
}

export default config
