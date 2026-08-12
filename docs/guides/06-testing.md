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

### Visual regression tests and Docker

The screenshot baselines committed under `__screenshots__` are compared with `threshold: 0` and carry
no platform suffix, so they are tied to one operating system and one browser build. Running the suite
natively on Windows or macOS compares your machine's font rasterization against Linux bytes and fails
regardless of whether anything actually changed.

Run anything visual in Docker instead. The image is built from the Playwright release matching
`@playwright/test` in `package.json`, which is what CI runs too:

```bash
yarn run e2e:docker
```

To accept intentional visual changes, regenerate the baselines the same way and commit the result:

```bash
yarn run e2e:docker:update-snapshots
```

Arguments are passed through, replacing the container's command — for example, to run one component:

```bash
yarn run e2e:docker yarn playwright test packages/components/button
```

The container always runs with `CI=true`, so that Playwright behaves the way it does on the runner.
Two consequences matter when debugging inside it: `test.only` is rejected outright rather than
honoured (`forbidOnly`), and a failing test is retried twice before being reported. Narrow a run with
a path and `-g` instead of `test.only`:

```bash
yarn run e2e:docker yarn playwright test packages/components/select -g "single select"
```

Requires Docker with Compose v2. On Windows carrying Docker Engine inside WSL rather than Docker
Desktop, `docker.exe` is often missing from the Windows PATH altogether — the Linux binary cannot be
projected onto it — but the wrapper also falls back to WSL when a `docker.exe` is present yet broken
(no Compose v2 plugin, a stale install). Either way it forwards the run through `wsl.exe` and
translates the paths it passes, so the commands above work unchanged from PowerShell. It looks for
Docker inside WSL's default distribution; set `WSL_DISTRIBUTION` to a distribution name if Docker
lives elsewhere. That check only confirms the CLI and Compose v2 plugin are present, not that the
daemon itself is reachable — a stopped daemon, or a WSL user outside the `docker` group, still
surfaces later, when the actual `docker compose run` fails.

### Worker count

A container reports every core on the host, and Playwright sizes its worker pool from that. Since all
workers drive one shared Angular dev server, the useful ceiling comes from that server rather than
from the core count — on a 32-core machine `workers: '100%'` means 64 browsers, and the suite
collapses into timeouts that look like failures but are not. The compose file therefore caps workers
at 8. Override it when a machine wants something different:

```bash
PLAYWRIGHT_WORKERS=16 yarn run e2e:docker
```

Baselines can also be regenerated without a local Docker install by commenting `/approve-snapshots`
on a pull request.
