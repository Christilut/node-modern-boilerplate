# Opinionated Node.js server API boilerplate

Based on [this boilerplate](https://github.com/KunalKapadia/express-mongoose-es6-rest-api).

This boilerplate is meant to be a starting point for small to medium Node.js projects. It comes fully loaded with goodies that many projects could use.

Of course there are many diffenent options to choose from out there, that's why this boilerplate is super opinionated about it and chooses the tech stack for you. Luckily the choices are faily modern and every third party integration has a free plan.

### Feature list

Added:
- TypeScript
- Mongoose / Typegoose
- GraphQL
- Email templates
- Mailgun helper
- Forest Admin integration
- User CRUD
- User login, registration, email verification & password reset
- Rate limiter
- Cloudwatch for logging
- Sentry.io for exceptions
- CLI command to create an admin user
- VSCode debugging settings
- TypeScript linting (not yet enforced because TS language server with tslint is not yet ready)

Not yet added:
- roll db secrets
- admin user tests

Not yet tested:
- forest admin with typegoose
- Code coverage
- deploy to heroku

// TODO model validation

## Overview

### Features

make table with all features laid out. if needed explain more below

todo

explain grapql, admin endpoint

graphql edit needs test:watch restart to see change (or just use test)

updating boilerplate? keep boilerplate repo as `boilerplate` git remote and pull & merge to update

explain how models, graphql, folder structure works

explain about parallel tests and in-mem db

explain public routes and how graphql is auth only

explain email templates

explain forest admin

explain env

explain cli

quickstart/setup guide (should work out of the box though)

troubleshooting?

add contributing

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

Set environment (vars):
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

Lint:
```sh
# Lint code with ESLint
npm run lint

# Run lint on any file change
npm run lint:watch
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

Questions, bugs, suggestions? Feel free to open an issue or message me on [Keybase](https://keybase.io/christilut)
