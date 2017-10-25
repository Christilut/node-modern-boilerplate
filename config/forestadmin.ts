import env from 'config/env'

module.exports = function(expressApp) {
  expressApp.use(require('forest-express-mongoose').init({
    envSecret: env.FOREST_ENV_SECRET,
    authSecret: env.FOREST_AUTH_SECRET,
    mongoose: require('mongoose')
  }))

  console.log('Loaded Forest Admin')
}
