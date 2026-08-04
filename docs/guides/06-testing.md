# Testing

## Unit tests

Unit tests check individual modules and components of the application in isolation. They are run using
[jest](https://jestjs.io/).

### Setup

```bash
yarn install
```

### Available commands

```bash
yarn run unit:components
yarn run unit:components-experimental
yarn run unit:angular-moment-adapter
yarn run unit:angular-luxon-adapter
yarn run unit:schematics
yarn run unit:koobiq-docs
yarn run unit:api-gen
yarn run unit:tools
```

## E2E tests

E2E (end-to-end) tests check the application as a whole, simulating user interactions. They are run using
[Playwright](https://playwright.dev/).

### Setup

```bash
yarn install
yarn run e2e:setup
```

### Available commands

```bash
yarn run e2e:components
```

The documentation site has its own smoke suite. It runs against the prerendered build, so that has to
exist first:

```bash
yarn run docs:build
yarn run e2e:docs
```
