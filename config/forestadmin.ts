import env from 'config/env'

module.exports = function(expressApp) {
  if (!env.FOREST_AUTH_SECRET || !env.FOREST_ENV_SECRET) {
    console.log('Missing Forest Admin credentials, not loading')
    return
  }

  expressApp.use(require('forest-express-mongoose').init({
    envSecret: env.FOREST_ENV_SECRET,
    authSecret: env.FOREST_AUTH_SECRET,
    mongoose: require('mongoose')
  }))

  console.log('Loaded Forest Admin')
}
