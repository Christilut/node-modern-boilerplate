import * as Joi from 'joi'

export interface IConfig {
  NODE_ENV?: string
  PORT?: number
  MONGO_HOST?: string
  DOMAIN?: string
  JWT_SECRET?: string
  FOREST_ENV_SECRET?: string
  FOREST_AUTH_SECRET?: string
  MAILGUN_API_KEY?: string
  MAILGUN_DOMAIN?: string
  EMAIL_FORGOT_SECRET?: string
  EMAIL_VERIFY_SECRET?: string
  EMAIL_FROM_ADDRESS?: string
  CLOUDWATCH_ACCESS_KEY?: string
  CLOUDWATCH_SECRET?: string
  CLOUDWATCH_REGION?: string
  SENTRY_URL?: string
}

// require and configure dotenv, will load vars in .env in PROCESS.ENV
require('dotenv').config()

// define validation for all the env vars
const allowedEnvKeys: Joi.SchemaMap = {
  NODE_ENV: Joi.string()
    .valid(['development', 'production', 'test'])
    .required(),
  PORT: Joi.number().default(5000).required(),
  MONGO_HOST: Joi.string().required(),
  DOMAIN: Joi.string().uri().optional(),
  JWT_SECRET: Joi.string().required(),
  FOREST_ENV_SECRET: Joi.string().optional(),
  FOREST_AUTH_SECRET: Joi.string().optional(),
  MAILGUN_API_KEY: Joi.string().optional(),
  MAILGUN_DOMAIN: Joi.string().optional(),
  EMAIL_FORGOT_SECRET: Joi.string().required(),
  EMAIL_VERIFY_SECRET: Joi.string().required(),
  EMAIL_FROM_ADDRESS: Joi.string().email().optional(),
  CLOUDWATCH_ACCESS_KEY: Joi.string().optional(),
  CLOUDWATCH_SECRET: Joi.string().optional(),
  CLOUDWATCH_REGION: Joi.string().optional(),
  SENTRY_URL: Joi.string().uri().optional()
}

let envVarsSchema = Joi.object(allowedEnvKeys).unknown().required()

if (process.env.NODE_ENV === 'production') {
  const envVarsProduction = Joi.object({

  })

  envVarsSchema = envVarsSchema.concat(envVarsProduction)
}

const { error, value: envVars } = Joi.validate(process.env, envVarsSchema)

if (error) {
  throw new Error(`Config validation error: ${error.message}`)
}

const envKeys = Object.keys(allowedEnvKeys)

const config: IConfig = {}

for (const key of envKeys) {
  config[key] = envVars[key]
}

export default config
