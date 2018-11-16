import * as httpStatus from 'http-status'

/**
 * @extends Error
 */
export class ExtendableError extends Error {
  status: number
  isPublic: boolean
  isOperational: boolean
  skipReportToSentry: boolean

  constructor(message: string, status: number, isPublic: boolean, skipReportToSentry: boolean = false) {
    // if (env.NODE_ENV === env.Environments.Test) console.log('\t', status, message)
    super(message)
    this.name = this.constructor.name
    this.message = message
    this.status = status
    this.isPublic = isPublic
    this.isOperational = true // This is required since bluebird 4 doesn't append it anymore.
    this.skipReportToSentry = skipReportToSentry

    Object.setPrototypeOf(this, ExtendableError.prototype)

    Error.captureStackTrace(this)
  }
}

/**
 * Class representing an API error.
 * @extends ExtendableError
 */
export class APIError extends ExtendableError {
  /**
   * Creates an API error.
   * @param {string} message - Error message.
   * @param {number} status - HTTP status code of error.
   * @param {boolean} isPublic - Whether the message should be visible to user or not.
   */
  constructor(message: string, status: number = httpStatus.INTERNAL_SERVER_ERROR, isPublic: boolean = false) {
    super(message, status, isPublic, true)
  }
}

export class ValidationError extends ExtendableError {
  constructor(message: string, status: number = httpStatus.INTERNAL_SERVER_ERROR, isPublic: boolean = false) {
    super(message, status, isPublic, true)
  }
}
