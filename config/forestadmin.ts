import expressApp from './express'

// TODO env

expressApp.use(require('forest-express-mongoose').init({
  envSecret: FOREST_ENV_SECRET,
  authSecret: FOREST_AUTH_SECRET,
  mongoose: require('mongoose')
}))
