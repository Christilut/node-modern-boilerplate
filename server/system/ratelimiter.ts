import env from 'config/env'
import * as Limiter from 'express-rate-limiter'
import * as MemoryStore from 'express-rate-limiter/lib/memoryStore'

export default new Limiter({
  db: new MemoryStore(),
  outerTimeLimit: 1 * 10 * 1000,
  outerLimit: env.NODE_ENV === 'test' ? 100000 : 40,
  innerLimit: env.NODE_ENV === 'test' ? 100000 : 20
})
