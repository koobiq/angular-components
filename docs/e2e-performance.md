# E2E performance: what a test pays before it starts

Measured 2026-09-17 against `main` at `c1f83a485`, with `@playwright/test` 1.62.1 and Angular 20.3.

## What was wrong

Every test opens a fresh browser context and navigates to its fixture. In CI that navigation cost
about 4.3 s before the test did anything: the median test took 4.8 s, the tenth percentile 4.4 s, and
a test that reads one bounding box took as long as one that takes two screenshots. The suite took
15 minutes on four workers.

| `E2E tests` run on `main`              | Tests | Median | p10   | Suite    |
| -------------------------------------- | ----- | ------ | ----- | -------- |
| 34376177502 (2026-09-09, before #2012) | 612   | 1.7 s  | 1.3 s | 5.2 min  |
| 34399277310 (2026-09-09, first after)  | 612   | 3.9 s  | 3.6 s | 10.8 min |
| 35238362778 (2026-09-17)               | 696   | 4.8 s  | 4.4 s | 15.0 min |

#2012 switched traces from `on-first-retry` to `retain-on-failure` at zero retries, so tracing runs
on every attempt. That policy stays — the trace is the artifact that explains a screenshot flake, see
[e2e-flakiness.md](e2e-flakiness.md). What made it expensive is what each page load carried.

## Three multipliers

1. **29 MB per page load.** `ng serve dev-e2e --configuration=production` served `main.js` as 11 MB
   of unminified code plus an 18 MB inline source map: `dev-e2e` was built with `optimization: false`
   and `sourceMap: true`, and Vite appends the map inline to the response. No compression, and a fresh
   context has an empty cache, so a run pulled about 20 GB through one Node process.
2. **Tracing reads every response body over CDP.** With `snapshots: true` — what `retain-on-failure`
   records — Playwright's HAR tracer calls `internalBody()` for every response, scripts included, and
   only afterwards drops script content (`omitScripts`). The archive stays small (275 KB: CSS and
   fonts), but the 29 MB crossed the protocol on every test and the trace waited for it. With
   `snapshots: false` the overhead is nil; the DOM snapshots are kept because they are the point.
3. **Four workers on four vCPUs**, next to the server and four Chromium instances: 2.5–4× on any
   CPU time.

Local cold loads of `E2eButtonStateAndStyle`, median of five, on a 16-core desktop:

| Server                                      | no trace | trace   | trace, 4× CPU throttle | 4 concurrent, trace |
| ------------------------------------------- | -------- | ------- | ---------------------- | ------------------- |
| `ng serve`, unminified + inline map (29 MB) | 848 ms   | 2033 ms | 5063 ms                | 3471 ms each        |
| `ng serve`, minified + inline map (23 MB)   | 1074 ms  | 1996 ms | 4452 ms                | 3542 ms each        |
| static files, unminified, no map (11 MB)    | 528 ms   | 1075 ms | 2682 ms                | 1695 ms each        |
| static files, minified, no map (4.3 MB)     | 466 ms   | 695 ms  | 1887 ms                | 953 ms each         |

The throttled `ng serve` row reproduces what CI sees. The second row is the surprise: minifying under
`ng serve` buys nothing, because Vite appends a source map to every JavaScript response regardless —
the build's own map when there is one, otherwise a generated identity map with `sourcesContent`,
which for a 4.3 MB minified file is 18.6 MB of base64. Nothing turns that off, so the suite is served
from `ng build` output instead.

## What changed

- `packages/e2e/routes.ts` keys the fixtures by class name instead of reading `component.name`,
  which minification mangles.
- `angular.json`: the `production` configuration of `dev-e2e` sets `sourceMap: false` and
  `optimization: { scripts: true, styles: false, fonts: false }`. Styles stay byte-identical — no
  minification, no `inlineCritical` — so no baseline moves. `yarn run dev:e2e` still uses the
  development configuration, with navigation and source maps.
- `tools/e2e/serve.mjs` builds that configuration and serves `dist/e2e/browser` as static files;
  `playwright.config.ts` and `tools/e2e/docker-compose.yml` start it instead of `ng serve`, and
  `yarn run serve:e2e` starts it by hand. The build takes about 22 s against 15 s for the unminified
  one, once per run.

Verified in the Docker image on the same 16-core machine, `PLAYWRIGHT_WORKERS=8`, both runs 696 passed
with no baseline changed:

| Server                         | Suite   | Median test | p10    | Sum of test durations |
| ------------------------------ | ------- | ----------- | ------ | --------------------- |
| `ng serve` (main at c1f83a485) | 6.6 min | 4.1 s       | 3.5 s  | 2928 s                |
| static build (this change)     | 2.2 min | 0.95 s      | 0.79 s | 770 s                 |

On the pull request’s own `E2E tests` run, 4 workers on the GitHub runner: 696 passed in 6.0 min against
15.0 min for `main` the same day, median test 1.6 s against 4.8 s, p10 1.3 s against 4.4 s. The job as
a whole went from 16.7 to 7.8 min; the rest is the image build.

## Not changed, and why

- **Trace policy.** `retain-on-failure` with DOM snapshots stays; the fix shrinks what it reads.
- **One page per `describe`.** Reverting `a086d7c71` would bring back the serial-mode amplification
  the flakiness audit removed.
- **Lazy routes.** `loadComponent` per fixture would cut a page load to roughly 1.5–2 MB, but
  `page.goto` would then resolve before the fixture chunk arrives, and every spec that reads right
  after `goto` would need auditing. Worth it only if the numbers above stop being enough.
- **The compose worker cap.** The 8 was measured against the 29 MB payload and has not been
  re-measured.

## Reproducing

CI numbers: `gh run view --job <id> --log` and take the duration each list-reporter line ends with.
Local numbers: serve the app, open a fresh context per load with `deviceScaleFactor: 2` and a
1200×720 viewport, optionally `tracing.start({ snapshots: true, screenshots: false })` and
`Emulation.setCPUThrottlingRate` over CDP, and time `page.goto` until the screenshot target is
visible.

## Local Docker on a 64-thread machine

Measured 2026-09-17 on the change above: `yarn run e2e:docker`, Docker Engine in WSL2 on a
64-thread / 256 GB host (WSL sees all 64 threads and 125 GB), repository on `/mnt/c`, which WSL
mounts over 9P. The compose file capped workers at 8 — a value measured against `ng serve` — and the
whole run took 4.0 min for a 2.2 min test phase.

### Worker count

Same commit, `--output /tmp/test-results` for every row except the first; peak CPU from
`docker stats`:

| Workers         | Test phase | Median | p90   | Failures | Peak CPU |
| --------------- | ---------- | ------ | ----- | -------- | -------- |
| 8, mount        | 132 s      | 0.96 s | 1.7 s | 0        | 12 cores |
| 8               | 126 s      | 0.95 s | 1.7 s | 0        | 13 cores |
| 16              | 90 s       | 1.2 s  | 2.1 s | 0        | 29 cores |
| 24              | 72 s       | 1.3 s  | 2.4 s | 0        | 42 cores |
| 32 (three runs) | 66–72 s    | 1.5 s  | 2.7 s | 0        | 47 cores |
| 48              | 66 s       | 2.2 s  | 3.4 s | 1        | 55 cores |
| 64              | 66 s       | 3.1 s  | 4.2 s | 0        | 56 cores |

The floor is about 66 s: past 32 workers the machine is saturated (a worker is Node plus several
Chromium processes, and every shot is a 2400×1440 PNG plus a pixelmatch), so more workers only add
latency per test. The failures are the ones the flakiness audit already names — the modal scrollbar
thumb (939 px) at 48 workers, and in a second run at 24 workers the same thumb plus a one-pixel
autofill diff in `form-field` — contention finding the windows that document describes. The compose
default is therefore `50%`, which Playwright resolves from the cores the container sees: 32 here,
8 on a 16-thread machine, 4 on a laptop.

### Artifacts on the 9P mount

`retain-on-failure` records a trace on every attempt: a network file appended on each response,
a resource file per stylesheet and font, snapshot events — a few dozen file operations per test,
serialized, and `BrowserContext.close()` waits for them before the test can end. With `test-results`
bind-mounted from `/mnt/c` each of those is a 9P round trip. At 8 workers the mount cost 6 s
(132 s against 126 s); at 32 workers, 84 s against 66–72 s. `playwright.config.ts` now reads
`PLAYWRIGHT_OUTPUT_DIR`, the compose file points it at `/tmp/test-results`, and
`tools/e2e/entrypoint.sh` copies the result into the mount when the command exits, so
`test-results/<test>/trace.zip` is still where the testing guide says.

### The build as an image layer

`ng build dev-e2e --configuration=production` cost about 22 s per run, spec changes included. The
Dockerfile now copies everything except `*.playwright-spec.ts` and `__screenshots__` first, builds,
then copies the rest, so BuildKit reuses the built layer whenever the sources are unchanged and the
server starts with `--skip-build`. A component change rebuilds during `docker build`, and a compile
error fails there with the compiler's message instead of as a webServer timeout.

Verified with the three changes in place, 32 workers: 696 passed in 52 s of tests and 1:43 overall on
the run that built the layer (25 s of it), then 696 passed in 45 s and 1:06 overall with the layer
cached — against 2.2 min of tests and 4.0 min overall before. Changing only a baseline left the build
layer cached and put the failing test’s trace and PNGs under `test-results` on the host; the
`update-snapshots` overlay still writes baselines into the working tree.

What remains fixed is 9P itself: scanning the build context and exporting the layers over it costs
tens of seconds per run. A checkout inside the WSL filesystem removes that; nothing in the repository
can.
