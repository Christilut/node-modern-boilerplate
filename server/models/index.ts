import * as path from 'path'
import * as fs from 'fs'
import { fileLoader, mergeTypes, mergeResolvers, GraphQlSchema } from 'merge-graphql-schemas'
import * as GraphQl from 'graphql-tools'

const schemas: string[] = []
const resolvers: string[] = []

fs.readdirSync(__dirname).forEach(dir => {
  if (dir.lastIndexOf('.ts') === dir.length - '.ts'.length) return

  fs.readdirSync(path.join(__dirname, dir)).forEach(file => {
    if (file.includes('.gql') || file.includes('.graphql')) {
      schemas.push(fs.readFileSync(path.join(__dirname, dir, file), 'utf8'))
    } else if (file.includes('resolver')) {
      resolvers.push(require(path.join(__dirname, dir, file)).default)
    }
  })
})

const mergedSchemas = mergeTypes(schemas)
const mergedResolvers = resolvers.length > 1 ? mergeResolvers(resolvers) : resolvers[0]

const schema: GraphQlSchema = GraphQl.makeExecutableSchema({ typeDefs: mergedSchemas, resolvers: mergedResolvers })

export default schema
