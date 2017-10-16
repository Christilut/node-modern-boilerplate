import env from 'config/env'
import httpStatus from 'http-status'

/**
 * @extends Error
 */
export class ExtendableError extends Error {
  status: Number
  isPublic: Boolean
  isOperational: Boolean

  constructor (message: String, status: Number, isPublic: Boolean) {
    if (env.NODE_ENV === 'test') console.log('\t', status, message)
    super(message.toString())
    this.name = this.constructor.name
    this.message = message.toString()
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
   * @param {String} message - Error message.
   * @param {Number} status - HTTP status code of error.
   * @param {Boolean} isPublic - Whether the message should be visible to user or not.
   */
  constructor (message: String, status: Number = httpStatus.INTERNAL_SERVER_ERROR, isPublic: Boolean = false) {
    super(message, status, isPublic)
  }
}
