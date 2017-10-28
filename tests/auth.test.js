/* eslint-disable no-unused-expressions */

const request = require('supertest')
const expect = require('chai').expect
const app = require('../../index')
const JwtDecode = require('jwt-decode')

const validUserCredentials = {
  name: 'testuser',
  email: 'bla@test.test',
  password: 'StrongPassword123#!'
}

const invalidUserCredentials = {
  name: 'testuser',
  email: 'invalid@test.test',
  password: 'IDontKnow'
}

const weakCredentials = {
  name: 'testuser',
  email: 'weak@test.test',
  password: 'weak'
}

let localUser
let localJwt

describe('## Auth APIs', () => {
  after(async () => {
    await request(app)
      .del('/api/v1/admin/users/' + localUser._id)
      .set('Authorization', global.adminJwt)
      .expect(httpStatus.OK)
  })

  describe('# POST /api/v1/auth/register', () => {
    it('should register a new user', (done) => {
      request(app)
        .post('/api/v1/auth/register')
        .send(validUserCredentials)
        .expect(httpStatus.OK)
        .then((res) => {
          expect(res.body.user._id).to.be.a('string')
          expect(res.body.user.name).to.be.a('string')
          expect(res.body.user.email).to.equal(validUserCredentials.email)
          expect(res.body.user.password).to.not.exist
          expect(res.body.user.roles).to.be.an('array').of.length(0)
          localUser = res.body.user
          localJwt = res.body.token

          const jwtDecoded = JwtDecode(localJwt)

          expect(jwtDecoded._id).to.exist.and.to.be.a('string')
          expect(jwtDecoded.email).and.to.be.a('string')
          expect(jwtDecoded.iat).and.to.be.a('number')
          expect(jwtDecoded.exp).and.to.be.a('number')
          expect(jwtDecoded).to.not.have.key('password')

          done()
        })
        .catch(done)
    })

    it('should error because email aleady exists', (done) => {
      request(app)
        .post('/api/v1/auth/register')
        .send(validUserCredentials)
        .expect(httpStatus.CONFLICT)
        .then((res) => {
          expect(res.body.message).to.equal('Email address is already in use')
          done()
        })
        .catch(done)
    })

    // TODO should test that new roles are added here upon register
    // maybe this can be one of the first test cases for the new parallel testing system?

    it('should error because of weak password', (done) => {
      request(app)
        .post('/api/v1/auth/register')
        .send(weakCredentials)
        .expect(httpStatus.BAD_REQUEST)
        .then((res) => {
          expect(res.body.message.indexOf('"password" with value "weak" fails to match the required pattern:')).to.equal(0)
          done()
        })
        .catch(done)
    })
  })

  describe('# POST /api/v1/auth/login', () => {
    it('should return Authentication error', (done) => {
      request(app)
        .post('/api/v1/auth/login')
        .send(invalidUserCredentials)
        .expect(httpStatus.UNAUTHORIZED)
        .then((res) => {
          done()
        })
        .catch(done)
    })

    it('should successfully log in user', (done) => {
      request(app)
        .post('/api/v1/auth/login')
        .send(validUserCredentials)
        .expect(httpStatus.OK)
        .then((res) => {
          expect(res.body.user).to.be.an('object')
          expect(res.body.user.email).to.equal(validUserCredentials.email)
          expect(res.body.user.password).to.not.exist
          expect(res.body.user.roles).to.be.an('array').of.length(0)
          done()
        })
        .catch(done)
    })
  })

  describe('# PUT /api/v1/user/me', () => {
    it('should update user name', (done) => {
      request(app)
        .put('/api/v1/user/me')
        .set('Authorization', localJwt)
        .send({
          name: 'changeduser'
        })
        .expect(httpStatus.OK)
        .then((res) => {
          expect(res.body).to.be.an('object')
          expect(res.body.email).to.be.a('string')
          expect(res.body.password).to.not.exist
          expect(res.body.roles).to.be.an('array').of.length(0)
          expect(res.body.name).to.equal('changeduser')

          done()
        })
        .catch(done)
    })
  })

  describe('# GET /api/v1/user/me', () => {
    it('should return sanitized User object of current user', (done) => {
      request(app)
        .get('/api/v1/user/me')
        .set('Authorization', localJwt)
        .expect(httpStatus.OK)
        .then((res) => {
          expect(res.body).to.be.an('object')
          expect(res.body.email).to.be.a('string')
          expect(res.body.password).to.not.exist
          expect(res.body.roles).to.be.an('array').of.length(0)

          done()
        })
        .catch(done)
    })
  })
})
