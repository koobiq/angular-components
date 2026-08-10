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

## Screenshots

The baselines under each component's `__screenshots__` directory are compared with `threshold: 0` and
have no platform suffix, so they belong to one operating system and one browser build. The commands
above only compare them meaningfully on Linux; anywhere else they fail on font rasterization alone.

Run anything visual in Docker, which uses the Playwright image matching `@playwright/test` and is what
CI runs as well:

```bash
# Run the suite in Docker
yarn run e2e:docker

# Accept intentional visual changes and rewrite the baselines
yarn run e2e:docker:update-snapshots
```

Requires Docker with Compose v2. On Windows, Docker Engine installed inside WSL puts no `docker.exe` on
the Windows PATH, so run these from inside the WSL distribution. Without a local Docker install,
comment `/approve-snapshots` on a pull request to regenerate the baselines in CI.
