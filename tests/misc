const request = require('supertest')
const expect = require('chai').expect
const app = require('../../index')

describe('## Misc', () => {
  describe('# GET /api/v1/misc/health-check', () => {
    it('should return OK', (done) => {
      request(app)
        .get('/api/v1/misc/health-check')
        .expect(httpStatus.OK)
        .then((res) => {
          expect(res.text).to.equal('OK')
          done()
        })
        .catch(done)
    })
  })

  describe('# GET /api/v1/404', () => {
    it('should return 404 status', (done) => {
      request(app)
        .get('/api/v1/404')
        .expect(httpStatus.NOT_FOUND)
        .then((res) => {
          expect(res.body.message).to.equal('Not Found')
          done()
        })
        .catch(done)
    })
  })

  describe('# Error Handling', () => {
    it('should handle express validation error - email is required', (done) => {
      request(app)
        .post('/api/v1/auth/register')
        .send({
          name: 'testuser',
          password: 'StrongPassword123#!'
        })
        .expect(httpStatus.BAD_REQUEST)
        .then((res) => {
          expect(res.body.message).to.equal('"email" is required')
          done()
        })
        .catch(done)
    })
  })
})
