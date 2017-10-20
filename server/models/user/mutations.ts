import { User, UserType } from './model'

export interface IUpsertUserArgs {
  name: string
  email: string
  password: string
}

export async function addUser(args: IUpsertUserArgs): Promise<UserType> {
  const user: UserType = new User()

  user.name = args.name
  user.email = args.email
  user.password = args.password

  await user.save()

  return user
}

export async function updateUser(id: string, args: IUpsertUserArgs) {
  const user = await User.findOneById(id) // TODO

  // TODO update password caues graphql error

  for (const key of Object.keys(args)) {
    if (args[key] !== undefined) user[key] = args[key]
  }

  await user.save()

  return user
}

// Note to self:
// Schema.gql User: these are the exposed properties, clients connecting to the graphql endpoint get these back
// Schema.gql Mutation: these are the properties allowed to be set by graphql
// IUpdateUserArgs: these are properties that are updatable from within the codebase (typescript will complain on unknown props)
// Model: has all properties that are saved to database and returned when fetching from database

// So a property like User.Roles cannot be updated from graphql because graphql will error since it is not in the Mutation schema.
// It can also not be updated from the codebase because Roles is not in IUpdateUserArgs
