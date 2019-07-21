import env from 'config/env'
import * as fs from 'fs'
import { GraphQLDateTime } from 'graphql-iso-date'
import * as GraphQl from 'graphql-tools'
import { mergeResolvers, mergeTypes } from 'merge-graphql-schemas'
import * as path from 'path'
import { GraphQLSchema } from 'graphql'

const modelDir = path.join(__dirname, '../../server/models')

// Note that in this file we use .js because the compiled code that is executed isnt Typescript but Javascript. However, in Development we use ts-node which executes .ts files directly, so we load those.
let extension = '.ts'

if (!env.DEBUG) {
  extension = '.js'
}

// Default schema, for graphql endpoint available to all authenticated users
function merge(): GraphQLSchema {
  const schemas: string[] = []
  const resolvers: any[] = [{
    DateTime: GraphQLDateTime
  }]

  fs.readdirSync(modelDir).forEach(dir => {
    if (dir.lastIndexOf(extension) === dir.length - extension.length) return

    let dirPath = path.join(modelDir, dir)

    if (fs.statSync(dirPath).isDirectory()) {
      // load schemas
      fs.readdirSync(dirPath).forEach(file => {
        if (file.includes('.gql')) {
          const content = fs.readFileSync(path.join(dirPath, file), 'utf8')

          if (content.length > 0) {
            schemas.push(content)
          }
        }
      })

      // load resolvers
      fs.readdirSync(dirPath).forEach(file => {
        if (file === 'resolvers' + extension) {
          resolvers.push(require(path.join(dirPath, file)).default)
        }
      })
    }
  })

  if (schemas.length > 0) {
    const mergedSchemas = mergeTypes(schemas)
    const mergedResolvers = resolvers.length > 1 ? mergeResolvers(resolvers) : resolvers[0]

    if (resolvers.length === 0) throw new Error('No resolvers found')

    return GraphQl.makeExecutableSchema({ typeDefs: mergedSchemas, resolvers: mergedResolvers })
  }
}

const schema: GraphQLSchema = merge()

export { schema }
