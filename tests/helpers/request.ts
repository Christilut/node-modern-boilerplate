import app from 'config/express'
import * as httpStatus from 'http-status'
import * as req from 'supertest'

export async function post(url: string, payload: Object, expectedStatus: number = httpStatus.OK): Promise<any> {
  const result = await req(app)
    .post(url)
    .send(payload)

  if (result.status !== expectedStatus) {
    const message = JSON.stringify(result.body.message ? result.body.message : result.body, null, ' ')

    throw new Error(`Get unexpected status ${result.status} instead of ${expectedStatus}: ${message}`)
  }

  return result
}

export async function get(url: string, expectedStatus: number = httpStatus.OK): Promise<any> {
  const result = await req(app)
    .get(url)

  if (result.status !== expectedStatus) {
    const message = JSON.stringify(result.body.message ? result.body.message : result.body, null, ' ')

    throw new Error(`Get unexpected status ${result.status} instead of ${expectedStatus}: ${message}`)
  }

  return result
}
