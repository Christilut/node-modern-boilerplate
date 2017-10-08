const Limiter = require('express-rate-limiter')
const MemoryStore = require('express-rate-limiter/lib/memoryStore')

const webhookLimiter = new Limiter({
  db: new MemoryStore(),
  outerTimeLimit: 1 * 60 * 1000,
  outerLimit: 1,
  innerLimit: 1
})

const apiLimiter = new Limiter({
  db: new MemoryStore(),
  outerTimeLimit: 1 * 10 * 1000,
  outerLimit: config.NODE_ENV === 'test' ? 100000 : 40,
  innerLimit: config.NODE_ENV === 'test' ? 100000 : 20
})

module.exports = {
  webhookLimiter,
  apiLimiter
}
