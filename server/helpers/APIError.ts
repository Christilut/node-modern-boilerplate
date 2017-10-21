import env from 'config/env'
import * as httpStatus from 'http-status'

/**
 * @extends Error
 */
export class ExtendableError extends Error {
  status: number
  isPublic: boolean
  isOperational: boolean

  constructor (message: string, status: number, isPublic: boolean) {
    if (env.NODE_ENV === 'test') console.log('\t', status, message)
    super(message)
    this.name = this.constructor.name
    this.message = message
    this.status = status
    this.isPublic = isPublic
    this.isOperational = true // This is required since bluebird 4 doesn't append it anymore.

    // Error.captureStackTrace(this, this.constructor.name) // TODO pre ts, test this
    Error.captureStackTrace(this)
  }
}

/**
 * Class representing an API error.
 * @extends ExtendableError
 */
export default class APIError extends ExtendableError {
  /**
   * Creates an API error.
   * @param {string} message - Error message.
   * @param {number} status - HTTP status code of error.
   * @param {boolean} isPublic - Whether the message should be visible to user or not.
   */
  constructor (message: string, status: number = httpStatus.INTERNAL_SERVER_ERROR, isPublic: boolean = false) {
    super(message, status, isPublic)
  }
}
