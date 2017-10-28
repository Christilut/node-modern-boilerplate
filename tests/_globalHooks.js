/* eslint-disable */
const request = require('supertest')
const chai = require('chai')
const expect = require('chai').expect
const app = require('../../index')

chai.config.includeStack = true
let websiteId

// Global before hook. Runs before any test.
before(async () => {
  const adminResponse = await request(app)
    .post('/api/v1/auth/register')
    .send({ name: 'admin', email: 'admin@admin.admin', password: 'StrongPassword123#!' }) // Note: admin@admin.admin is special email for admin user if NODE_ENV === 'test'
    .expect(httpStatus.OK)
  global.adminJwt = adminResponse.body.token

  const userResponse = await request(app)
    .post('/api/v1/auth/register')
    .send({ name: 'testuser', email: 'user1@test.test', password: 'StrongPassword123#!' })
    .expect(httpStatus.OK)
  global.user1 = userResponse.body.user
  global.jwt1 = userResponse.body.token

  const secondUserResponse = await request(app)
    .post('/api/v1/auth/register')
    .send({ name: 'testuser', email: 'user2@test.test', password: 'StrongPassword123#!' })
    .expect(httpStatus.OK)
  global.user2 = secondUserResponse.body.user
  global.jwt2 = secondUserResponse.body.token
})

// Admin user is never deleted, DB is destroyed anyway
