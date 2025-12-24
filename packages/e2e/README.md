# E2E testing

Application and [utilities](packages/e2e/utils/index.ts) for [playwright](https://playwright.dev/) visual regression tests.

## Development

Make sure you have the [correct version](.nvmrc) of Node.js installed (we recommend using [nvm](https://github.com/nvm-sh/nvm)).

```bash
# Setup Node.js
nvm use

# Install dependencies
yarn install

# Start dev server
yarn run dev:e2e

# Setup playwright
yarn run e2e:setup

# Run all E2E tests
yarn run e2e:components

# Run a specific E2E test file
yarn playwright test packages/components/button/e2e.playwright-spec.ts
```
