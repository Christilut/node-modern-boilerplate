import { User } from './model'

export async function updateUser(id: String, args: any) {
  const user = await User.findOneById(id)

  if (args.name) user.name = args.name
  if (args.email) user.email = args.email
  if (args.password) user.password = args.password

  await user.save()

  return user
}

// TODO arg typings?
