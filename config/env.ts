import * as Joi from 'joi'

export interface IConfig {
  NODE_ENV?: string
  PORT?: number
  MONGO_HOST?: string
  JWT_SECRET?: string
  MAILGUN_API_KEY?: string
  MAILGUN_DOMAIN?: string
  EMAIL_FORGOT_SECRET?: string
  EMAIL_VERIFY_SECRET?: string
  EMAIL_FROM_ADDRESS?: string
  AWS_ACCESS_KEY?: string
  AWS_SECRET?: string
  AWS_REGION?: string
  FRONTEND_DOMAIN?: string
  SENTRY_URL?: string
}

// require and configure dotenv, will load vars in .env in PROCESS.ENV
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config()
}

// define validation for all the env vars
const allowedEnvKeys: Joi.SchemaMap = {
  NODE_ENV: Joi.string()
    .valid(['development', 'production', 'test'])
    .required(),
  PORT: Joi.number().default(4040).required(),
  MONGO_HOST: Joi.string().required(),
  JWT_SECRET: Joi.string().required(),
  MAILGUN_API_KEY: Joi.string().required(),
  MAILGUN_DOMAIN: Joi.string().required(),
  EMAIL_FORGOT_SECRET: Joi.string().required(),
  EMAIL_VERIFY_SECRET: Joi.string().required(),
  EMAIL_FROM_ADDRESS: Joi.string().email().required(),
  AWS_ACCESS_KEY: Joi.string().required(),
  AWS_SECRET: Joi.string().required(),
  AWS_REGION: Joi.string().required(),
  FRONTEND_DOMAIN: Joi.string().uri().required(),
  SENTRY_URL: Joi.string().uri().required()
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
