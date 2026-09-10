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
The consequence that matters when debugging inside it is that `test.only` is rejected outright
rather than honoured (`forbidOnly`). Retries are not one of the differences — they are 0 in the
container, on the runner and locally alike, see Retries below. Narrow a run with a path and `-g`
instead of `test.only`:

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

### Retries

A test that passes on a retry is reported as flaky and does not fail the run, which means a suite
can be reliably green and still be unreliable. Retries are therefore 0 everywhere — locally, in the
container and on the runner: an unstable test fails the run and gets named instead of absorbed.

Set `PLAYWRIGHT_RETRIES` when a run has to be nursed through a known flake:

```bash
PLAYWRIGHT_RETRIES=2 yarn run e2e:docker
```

Repeating each test is what turns a single red run into evidence, since one failure on its own does
not distinguish a flake from a regression. Traces come with the failure — the config records them
`retain-on-failure` — so there is nothing extra to pass:

```bash
node tools/e2e/run.js yarn playwright test packages/components --repeat-each=5
```

A failure leaves its trace at `test-results/<test-dir>/trace.zip` — through the bind mount, so a
Docker run reaches it too — and the report embeds a copy. Open either:

```bash
npx playwright show-trace test-results/<test-dir>/trace.zip
npx playwright show-report                                    # the same traces, per failed test
```

The trace carries the DOM snapshots, the network log and the action log, which is what separates
"the wait resolved a frame early" from "the pixels really changed". The screencast is turned off
in the config — the pixels are already attached as `-actual.png`, `-expected.png` and `-diff.png`.

On PowerShell the assignment is separate: `$env:PLAYWRIGHT_RETRIES = '2'; yarn run e2e:docker`.

The `E2E tests` workflow takes the same value as a `retries` input through `workflow_dispatch`.

[e2e-flakiness.md](../e2e-flakiness.md) records what the first run at zero retries found: the
mechanisms behind each flake the suite had, and which ones remain unexplained.

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
