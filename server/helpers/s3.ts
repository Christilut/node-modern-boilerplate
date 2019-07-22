import * as AWS from 'aws-sdk'
import env from 'config/env'
import logger from 'config/logger'
import * as httpStatus from 'http-status'
import { APIError } from 'server/helpers/error'
import * as uuidv1 from 'uuid/v1'
import { message } from '../../config/sentry'

const DEFAULT_PRESIGNED_URL_EXPIRE_SECONDS = 60 * 15

const s3 = new AWS.S3()
const cloudfront = new AWS.CloudFront()

export interface IFtpUploadFeedbackArgs {
  orgId: string
  notificationEndpoint: string
  leaseId: string
}

export interface IFtpUploadArgs {
  feedback: IFtpUploadFeedbackArgs // Needed for notification feedback if FTP upload goes wrong. Since it is probably the users fault
  host: string
  username: string
  password: string
  files: IQueueFile[]
}

export interface IDownloadFileArgs {
  bucket: string
  key: string
}

export interface IQueueFile {
  filename: string
  key?: string
  content?: Buffer
}

export async function downloadFile(args: IDownloadFileArgs): Promise<Buffer> {
  const s3Params = {
    Bucket: args.bucket,
    Key: args.key
  }

  try {
    let s3Result = {} as any
    if (env.NODE_ENV !== env.Environments.Test) {
      s3Result = await s3.getObject(s3Params).promise()
    }

    return s3Result.Body
  } catch (error) {
    message('S3 Failed to download file.', {
      extra: {
        s3Message: error.message,
        s3Params
      }
    })
  }
}

export async function downloadArrayFromS3AndRemove(s3files: IQueueFile[], bucket: string): Promise<Buffer[]> {
  const hasFiles = s3files && s3files.length > 0

  if (hasFiles) {
    const files = []

    for (const file of s3files) {
      const s3ParamsFile = {
        Bucket: bucket,
        Key: file.key
      }

      let s3Data = {} as any
      if (env.NODE_ENV !== env.Environments.Test) {
        s3Data = await s3.getObject(s3ParamsFile).promise()
      }

      files.push({
        filename: file.filename,
        content: s3Data.Body
      })

      try {
        if (env.NODE_ENV !== env.Environments.Test) {
          await s3.deleteObject({
            Bucket: bucket,
            Key: file.key
          }).promise()
        }
      } catch (error) {
        logger.warn('Failed to delete file from S3. Ignoring.', {
          errorMessage: error.message,
          bucket,
          attachment: file.key
        })

        message('Failed to delete file from S3', {
          errorMessage: error.message,
          bucket,
          attachment: file.key
        })
      }

      return files
    }
  }
}

export async function removeFile(key: string, bucket: string) {
  logger.info('Removing file from S3', {
    key,
    bucket
  })

  if (key[0] === '/') key = key.substring(1) // S3 doesn't like starting slash

  try {
    if (env.NODE_ENV !== env.Environments.Test) {
      const s3Result = await s3.deleteObject({
        Bucket: bucket,
        Key: key
      }).promise()

      logger.info('Removed file from S3', {
        key,
        bucket,
        s3Result
      })
    }
  } catch (error) {
    logger.warn('Failed to delete file from S3. Ignoring.', {
      errorMessage: error.message,
      bucket,
      key
    })

    message('Failed to delete single file from S3', {
      errorMessage: error.message,
      bucket,
      key
    })
  }
}

export async function removeFolder(folder: string, bucket: string) {
  logger.info('Removing folder from S3', {
    folder,
    bucket
  })

  if (env.NODE_ENV === env.Environments.Test) return

  const listParams = {
    Bucket: bucket,
    Prefix: folder
  }

  let folderObjects
  try {
    if (env.NODE_ENV !== env.Environments.Test) {
      folderObjects = await s3.listObjects(listParams).promise()
    }
  } catch (error) {
    logger.warn('Failed to list folder on S3. Not deleting folder.', {
      errorMessage: error.message,
      bucket,
      folder
    })

    message('Failed to list folder on S3. Not deleting folder.', {
      errorMessage: error.message,
      bucket,
      folder
    })

    return // Dont continue
  }

  const deleteParams = {
    Bucket: bucket,
    Delete: {
      Objects: folderObjects.Contents.map(x => {
        return {
          Key: x.Key
        }
      })
    }
  }

  try {
    if (env.NODE_ENV !== env.Environments.Test) {
      const deletedObjects = await s3.deleteObjects(deleteParams).promise()

      logger.info('Removed folder from S3', deletedObjects)
    }
  } catch (error) {
    logger.warn('Failed to delete file from S3. Ignoring.', {
      errorMessage: error.message,
      bucket,
      folder
    })

    message('Failed to delete folder from S3', {
      errorMessage: error.message,
      bucket,
      folder
    })
  }
}

export async function uploadFileToS3(file: IQueueFile, bucket: string): Promise<string> {
  if (!(file.content instanceof Buffer)) {
    throw new Error('File content must be a buffer')
  }

  const s3Params = {
    Bucket: bucket,
    Key: uuidv1(),
    Body: file.content
  }

  let s3Data = {} as any
  if (env.NODE_ENV !== env.Environments.Test) {
    s3Data = await s3.upload(s3Params).promise()
  }

  logger.info('Uploaded file to S3', s3Data)

  return s3Data.Key
}

export async function uploadArrayToS3(files: IQueueFile[], bucket: string): Promise<IQueueFile[]> {
  const s3files: IQueueFile[] = []

  for (const file of files) {
    const s3Key = await uploadFileToS3(file, bucket)

    s3files.push({
      filename: file.filename,
      key: s3Key
    })
  }

  return s3files
}

export async function createPresignedUrl(key: string, bucket: string, expiresSeconds: number = DEFAULT_PRESIGNED_URL_EXPIRE_SECONDS): Promise<string> {
  const s3Params = {
    Bucket: bucket,
    Key: key,
    Expires: expiresSeconds
  }

  logger.info('Generating pre-signed URL', s3Params)

  const presignedUrl = await s3.getSignedUrl('putObject', s3Params)

  return presignedUrl
}

export async function downloadFileAsBase64(key: string, bucket: string): Promise<string> {
  const s3Params: IDownloadFileArgs = {
    bucket,
    key
  }

  const file = await downloadFile(s3Params)

  if (!file) {
    message('download as base64: key not found on s3', {
      extra: {
        s3Params
      }
    })

    throw new APIError('lease not found on s3', httpStatus.INTERNAL_SERVER_ERROR)
  }

  return 'data:text/plain;base64,' + file.toString('base64')
}
