import Joi from 'joi'

export interface IConfig {
  NODE_ENV?: string
  PORT?: number
  MONGOOSE_DEBUG?: boolean
  JWT_SECRET?: string
  MONGO_HOST?: string
  MONGO_PORT?: number
  MAILGUN_API_KEY?: string
  MAILGUN_DOMAIN?: string
  EMAIL_FORGOT_SECRET?: string
  EMAIL_VERIFY_SECRET?: string
}

// require and configure dotenv, will load vars in .env in PROCESS.ENV
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config()
}

// define validation for all the env vars
let envVarsSchema = Joi.object({
  NODE_ENV: Joi.string()
    .valid(['development', 'production', 'test'])
    .required(),
  PORT: Joi.number().default(4040).required(),
  MONGOOSE_DEBUG: Joi.boolean()
    .when('NODE_ENV', {
      is: Joi.string().equal('development'),
      then: Joi.boolean().default(true),
      otherwise: Joi.boolean().default(false)
    }),
  JWT_SECRET: Joi.string().required()
    .description('JWT Secret required to sign'),
  MONGO_HOST: Joi.string().required()
    .description('Mongo DB host url'),
  MONGO_PORT: Joi.number().default(27017),
  MAILGUN_API_KEY: Joi.string().required(),
  MAILGUN_DOMAIN: Joi.string().required(),
  EMAIL_FORGOT_SECRET: Joi.string().required(),
  EMAIL_VERIFY_SECRET: Joi.string().required()
}).unknown()
  .required()

if (process.env.NODE_ENV === 'production') {
  const envVarsProduction = Joi.object({

  })

  envVarsSchema = envVarsSchema.concat(envVarsProduction)
}

const { error, value: envVars } = Joi.validate(process.env, envVarsSchema)

if (error) {
  throw new Error(`Config validation error: ${error.message}`)
}

const envKeys = envVarsSchema._inner.children.map(x => x.key)

const config: IConfig = {}

for (const key of envKeys) {
  config[key] = envVars[key]
}

export default config
