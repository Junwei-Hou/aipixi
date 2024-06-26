### api: Nodejs Express TypeScript
### web: React
### database: Postgre SQL

#### Introduction

- User can use sample to play the game, or they can login in with their e-mail, shoot or upload their photo 
- After creation of AI photo, user will play jigsaw game, and then if they think it is interesting, they can copy the link and send it to their friend

---

#### Docker

A comprehensive template. Works out of the box for most Node.js projects with following pieces

- [Docker] as the container service to isolate the environment.
- [Node.js](Long-Term-Support Version) as the run-time environment to run JavaScript.
- [Express.js]as the server framework / controller layer
- [Postgre SQL]as the database layer
- [TypeORM] as the "ORM" / model layer
- [TypeDI] Dependency Injection for TypeScript.
- [Routing-Controllers] Create structured, declarative and beautifully organized class-based controllers with heavy decorators usage in Express using TypeScript and Routing Controllers Framework.
- [Helmet] Helmet helps you secure your Express apps by setting various HTTP headers. It’s not a silver bullet, but it can help!
- [Swagger] API Tool to describe and document your api

---

#### Features

- TypeScript
- ESLint with some initial rules recommendation
- Jest for fast unit testing and code coverage
- Type definitions for Node.js and Jest
- NPM scripts for common operations
- Simple example of TypeScript code and unit test
- Example configuration for GitHub Actions

---

##### Getting Started

#### Docker

- Clone the repository
- Run `docker-compose up`

#### Without Docker

- Clone the repository

 You need to install postgreSQL manually for the installation [guide](https://www.enterprisedb.com/downloads/postgres-postgresql-downloads)

- Run `npm install`
- Run `npm run typeorm schema:sync`
- Run `npm run typeorm migration:run`
- Run `npm i ts-node -g`
- Run `npm run dev`

\* You need to set environment variables to provide configuration for database connection. Please see `src/config.ts` for environment variable names.

---

After the server is setup, you will be provided with an API Key on the terminal.
The API will be useable from the documentation available at http://localhost:3000/docs.

---

### Available Scripts

- `clean` - remove coverage data, Jest cache and transpiled files,
- `build` - transpile TypeScript to ES6,
- `build:watch` - interactive watch mode to automatically transpile source files,
- `lint` - lint source files and tests,
- `test` - run tests,
- `test:watch` - interactive watch mode to automatically re-run tests
- `watch` - automatically restart the application when file changes in the directory are detected

### License

[MIT](/LICENSE)
