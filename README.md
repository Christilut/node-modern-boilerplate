# Opinionated Node.js server API boilerplate

Based on [this boilerplate](https://github.com/KunalKapadia/express-mongoose-es6-rest-api).

### Changes with above boilerplate:

Removed:
- Babel
- Yarn

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
- AVA for parallel integration testing (and test cases for everything)
- roll db secrets

Not yet tested:
- forest admin with typegoose
- Code coverage
- mailgun
- deploy to heroku

## Overview

### Features

todo

explain grapql, admin endpoint

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
