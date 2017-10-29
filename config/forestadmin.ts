import env from 'config/env'

module.exports = function(expressApp) {
  if (!env.FOREST_AUTH_SECRET || !env.FOREST_ENV_SECRET) {
    console.log('Forest Admin: Missing credentials, not loading')
    return
  }

  if (env.NODE_ENV === 'production') {
    expressApp.use(require('forest-express-mongoose').init({
      envSecret: env.FOREST_ENV_SECRET,
      authSecret: env.FOREST_AUTH_SECRET,
      mongoose: require('mongoose')
    }))

    console.log('Forest Admin: Loaded')
  } else if (env.NODE_ENV !== 'test') {
    console.log('Forest Admin: Not loading outside production environment')
  }
}
