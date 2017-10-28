// import * as Inquirer from 'inquirer'
// import * as Joi from 'joi'
// import validate from './_validation'
// import { strongPasswordRegex } from '../server/helpers/regex'
import { UserModel, Roles } from '../server/models/user/model'

// const questions: Inquirer.Question[] = [
//   {
//     type: 'input',
//     name: 'name',
//     message: 'New admin name:',
//     validate: (v) => validate(v, Joi.string().required().min(3), 'Name must be atleast 3 characters')
//   },
//   {
//     type: 'input',
//     name: 'email',
//     message: 'New admin email address:',
//     validate: (v) => validate(v, Joi.string().required().email(), 'Please enter a valid email address')
//   },
//   {
//     type: 'password',
//     name: 'password',
//     mask: '🔑',
//     message: 'New admin password:',
//     validate: (v) => validate(v, Joi.string().required().regex(strongPasswordRegex), 'Please use atleast 1 number, lowercase- and uppercase letter and a symbol')
//   },
//   {
//     type: 'password',
//     name: 'password-repeated',
//     mask: '🔑',
//     message: 'Repeat new admin password:',
//     validate: (v, answers) => {
//       if (v !== answers.password) return 'Passwords do not match'
//       return true
//     }
//   }
// ];

(async () => {
  console.log('You are now creating a new Admin user. Please answer a few questions.')

  // const answers = await Inquirer.prompt(questions)
  const answers = {
    name: 'admin',
    email: 'test@test.test',
    roles: [Roles.Admin],
    password: '$Welkom123'
  }

  require('config/mongoose')

  const user = new UserModel(answers)

  try {
    await user.save()

    console.log('Admin user created')
  } catch (error) {
    console.log(`Something went wrong when trying to save the admin user: (${error.message})`)
    process.exit(0)
  }
})()

// TODO fix model pre-save
