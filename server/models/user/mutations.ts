import { User } from './model'

export interface IUpdateUserArgs {
  name: String
  email: String
  password: String
}

export async function updateUser(id: String, args: IUpdateUserArgs) {
  const user = await User.findOneById(id)

  if (args.name) user.name = args.name
  if (args.email) user.email = args.email
  if (args.password) user.password = args.password

  await user.save()

  return user
}

// Note to self:
// schema is in schema.gql (only exposed props)
// schema is in arg interface (only updateable props)
// schema is also in model (all props)
