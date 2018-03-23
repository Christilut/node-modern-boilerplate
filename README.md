# Modern Node.js API boilerplate

This boilerplate is meant to be a starting point for small to medium Node.js API projects. It comes fully loaded with goodies that many projects could use.

Of course there are many diffenent options to choose from out there, that's why this boilerplate is super opinionated about it and chooses the tech stack for you. Luckily the choices are faily modern and every third party integration has a free plan.

## Overview

| Feature |  |
|---|---|
| TypeScript | Typings for JavaScript |
| Mongoose | MongoDB models |
| Typegoose | Combines Mongoose and TypeScript |
| GraphlQL | GraphQL integration and User example |
| Email templates | Example email templates |
| Mailgun helper | Helper to compile email templates and send through Mailgun |
| Forest Admin | Basic Forest Admin integration setup |
| User CRUD | GraphlQL example setup to CRUD users |
| User auth | User login, registration, email verification and password reset |
| Rate limiter | Rate limiter setup on public routes |
| Cloudwatch logging | Logging to AWS Cloudwatch |
| Sentry.io | Sentry integration for exception handling |
| Precommit hook | Runs tests before every commit |
| CLI commands | CLI example command to create admin users |
| VSCode debugging | Visual Studio Code debugging settings |
| Parallel testing | Parallel atomic testing with mock in-memory mongo database |
| Code coverage | Generate code coverage reports |

### Graphql

Explanation of the model, mutations, schema:

Take the User model as an example and work from there.

Schema.gql User: these are the exposed properties, clients connecting to the graphql endpoint get these back
Schema.gql Mutation: these are the properties allowed to be set by graphql
IUpdateUserArgs: these are properties that are updatable from within the codebase (typescript will complain on unknown props)
Model: has all properties that are saved to database and returned when fetching from database

So a property like User.Roles cannot be updated from graphql because graphql will error since it is not in the Mutation schema.
It can also not be updated from the codebase because Roles is not in IUpdateUserArgs

Minor note: when changing GraphQL schema, you need to restart the `test:watch` job in order to see the schema changes.

### Testing

Tests are run by AVA which runs all tests in parallel. This is great because not only is it much faster than running them in series but also forces you write atomic tests, so no test should depend on any other test.

An in-memory Mongo database is setup and the tests uses actual express endpoints so the tests are about as close to the real deal as possible.

### Public routes

There are some public routes for authentication such as login, account verification and registration.

The GraphQL routes are setup for logged in users only.

### Email templates

There are some email templates provided. They are taken from Mailgun and should work properly on any email client. You can send mails with the email helper by providing the right parameters.

See `server/models/user/model.ts` for an example.

## Getting Started

Clone the repo:
```sh
git clone https://github.com/Christilut/node-api-boilerplate
cd node-api-boilerplate
```

Install dependencies:
```sh
npm install
```

Set environment variables. Remember: Don't save secrets to git!:
```sh
cp .env.example .env
```

Start server:
```sh
# Start server
npm run dev

Tests:
```sh
# Run tests
npm run test

# Run test along with code coverage
npm run test:coverage

# Run tests on file change
npm run test:watch

# Run tests enforcing code coverage (configured via .istanbul.yml)
npm run test:check-coverage
```

##### Deployment

Deploy to Heroku.

Initialize Heroku by adding the heroku remote (follow Heroku's instructions) and `npm run deploy`

## Logging

Universal logging library [winston](https://www.npmjs.com/package/winston) is used for logging. It has support for multiple transports.  A transport is essentially a storage device for your logs. Each instance of a winston logger can have multiple transports configured at different levels. For example, one may want error logs to be stored in a persistent remote location (like a database), but all logs output to the console or a local file. We just log to the console for simplicity, you can configure more transports as per your requirement.

In prodution, winston logs to AWS Cloudwatch. You can easily change this in `config/winston.js`.

## Contributing

Contributions, questions and comments are all welcome and encouraged. For code contributions submit a pull request with unit test.

## License

MIT License. Feel free to do whatever you want with this.

## Contact

Questions, bugs, suggestions? Feel free to open an issue and I'll get back to you!
