import env from 'config/env'
import * as path from 'path'
import * as fs from 'fs'
import { fileLoader, mergeTypes, mergeResolvers, GraphQlSchema } from 'merge-graphql-schemas'
import * as GraphQl from 'graphql-tools'


const modelDir = path.join(__dirname, '../../server/models')

// Note that in this file we use .js because the compiled code that is executed isnt Typescript but Javascript. However, in Development we use ts-node which executes .ts files directly, so we load those.
let extension = '.js'
if (env.NODE_ENV === env.Environments.Development) {
  extension = '.ts'
}

// Default schema, for graphql endpoint available to all authenticated users
function merge(isAdmin: boolean): GraphQlSchema {
  const schemas: string[] = []
  const resolvers: string[] = []

  fs.readdirSync(modelDir).forEach(dir => {
    if (dir.lastIndexOf(extension) === dir.length - extension.length) return

    let dirPath = path.join(modelDir, dir)

    if (isAdmin) {
      // Load shared schema
      schemas.push(fs.readFileSync(path.join(dirPath, 'shared.gql'), 'utf8'))

      // Then change to admin subfolder path
      dirPath = path.join(dirPath, 'admin')
    }

    // load schemas
    fs.readdirSync(dirPath).forEach(file => {
      if (file.includes('.gql')) {
        schemas.push(fs.readFileSync(path.join(dirPath, file), 'utf8'))
      }
    })

    // load resolvers
    fs.readdirSync(dirPath).forEach(file => {
      if (file === 'resolvers' + extension) {
        resolvers.push(require(path.join(dirPath, file)).default)
      }
    })
  })

  if (schemas.length > 0) {
    const mergedSchemas = mergeTypes(schemas)
    const mergedResolvers = resolvers.length > 1 ? mergeResolvers(resolvers) : resolvers[0]

    if (resolvers.length === 0) throw new Error('No resolvers found')

    return GraphQl.makeExecutableSchema({ typeDefs: mergedSchemas, resolvers: mergedResolvers })
  }
}

const schema: GraphQlSchema = merge(false)
const adminSchema: GraphQlSchema = merge(true)

export {
  schema,
  adminSchema
}
