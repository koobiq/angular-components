import { defineConfig, devices, ViewportSize } from '@playwright/test';

const isCI = !!process.env.CI;
const viewport: ViewportSize = {
    width: 1200,
    height: 720
};
const baseURL = process.env.BASE_URL || 'http://localhost:4200';
const webServerCommand = process.env.WEB_SERVER_COMMAND || 'yarn run dev:e2e --configuration=production';

/**
 * Every worker drives its own browser against one shared Angular dev server, so the useful ceiling
 * comes from that server rather than from the core count. '100%' suits a 4-vCPU CI runner, but not
 * Docker: a container reports every core on the host (Playwright reads `os.cpus()`, which no cgroup
 * or cpuset limit affects), so on a 32-core machine it means 64 browsers and the suite collapses
 * into timeouts. tools/e2e's compose file caps it via PLAYWRIGHT_WORKERS and CI sets it back.
 *
 * Playwright only accepts a string when it is a percentage, so anything else has to become a number.
 * With the variable unset this behaves exactly as it did before.
 *
 * The value is validated rather than passed through, because Playwright's own guard only rejects
 * `workers <= 0` — and `NaN <= 0` is false. A typo like `PLAYWRIGHT_WORKERS=amx` would therefore
 * reach the dispatcher's `for (i = 0; i < workers; i++)` loop, spawn zero workers, run zero tests,
 * write no report, and still exit 0: a green suite that tested nothing.
 */
const resolveWorkers = () => {
    const override = process.env.PLAYWRIGHT_WORKERS?.trim();

    if (!override) {
        return isCI ? '100%' : undefined;
    }

    if (override.endsWith('%')) {
        const percentage = Number(override.slice(0, -1));

        if (!Number.isFinite(percentage) || percentage <= 0) {
            throw new Error(`PLAYWRIGHT_WORKERS must be a positive percentage, got ${JSON.stringify(override)}.`);
        }

        return override;
    }

    const workers = Number(override);

    if (!Number.isInteger(workers) || workers <= 0) {
        throw new Error(
            `PLAYWRIGHT_WORKERS must be a positive integer or a percentage, got ${JSON.stringify(override)}.`
        );
    }

    return workers;
};

/**
 * Retries hide flakiness rather than remove it: a test that fails and then passes is reported as
 * flaky and does not fail the run, so a suite can be reliably green and still be unreliable. The
 * default is therefore 0 everywhere, CI included — an unstable test fails the run and is named
 * rather than absorbed. PLAYWRIGHT_RETRIES is the escape hatch for a run that has to be nursed
 * through a known flake.
 *
 * Validated for the same reason as resolveWorkers above: Playwright's own guard rejects a negative
 * number but not NaN, so `PLAYWRIGHT_RETRIES=none` would reach the runner and be treated as no
 * retries at all — the right answer by accident, and the wrong one as soon as the value was meant
 * to be 2.
 */
const resolveRetries = () => {
    const override = process.env.PLAYWRIGHT_RETRIES?.trim();

    if (!override) {
        return 0;
    }

    const retries = Number(override);

    if (!Number.isInteger(retries) || retries < 0) {
        throw new Error(`PLAYWRIGHT_RETRIES must be a non-negative integer, got ${JSON.stringify(override)}.`);
    }

    return retries;
};

/** @see https://playwright.dev/docs/test-configuration */
export default defineConfig({
    testDir: __dirname,
    testMatch: ['**/*.playwright-spec.ts'],
    tsconfig: 'tsconfig.playwright-spec.json',
    timeout: 15 * 1000,
    fullyParallel: true,
    forbidOnly: isCI,
    retries: resolveRetries(),
    workers: resolveWorkers(),
    reporter: [
        ['list', { printSteps: true }],
        ['html', { open: 'never' }]
    ],
    projects: [
        {
            name: 'Chrome',
            use: {
                ...devices['Desktop Chrome HiDPI'],
                viewport
            }
        }
    ],
    expect: {
        // These baselines are compared with threshold: 0, so they are tied to one exact browser
        // build. @playwright/test is pinned to an exact version in package.json for that reason:
        // even a patch release can bump the bundled Chromium — 1.55.0 shipped build 1187 and
        // 1.55.1 shipped 1193 — and that invalidates every screenshot. Upgrade it on its own
        // branch and refresh the baselines with /approve-snapshots in the same pull request.
        toHaveScreenshot: {
            pathTemplate: '{testFileDir}/__screenshots__/{arg}{ext}',
            threshold: 0,
            scale: 'device',
            animations: 'disabled'
        }
    },
    webServer: {
        command: webServerCommand,
        url: baseURL,
        timeout: 10 * 60 * 1000,
        reuseExistingServer: !isCI
    },
    use: {
        baseURL: baseURL,
        // `on-first-retry` was the cheap choice while retries existed: the trace came free on the
        // retry a failing test was going to get anyway. With retries at 0 that never fires, and a
        // failure would leave only the screenshot diff — the wrong artifact for the flakes here,
        // since a wait that resolved a frame early tells you nothing in a still image.
        //
        // `screenshots: false` drops the trace's screencast, which is the expensive half twice
        // over. It takes CPU from every test, including the ones that pass and discard the trace,
        // and the flakes this suite has are the ones that only appear under load (see
        // docs/e2e-flakiness.md), so the recorder would manufacture the failures it exists to
        // explain. It also dominates trace size, which decides how large the uploaded report gets
        // on the run where a Chromium bump invalidates every baseline at once. What is kept — DOM
        // snapshots, network, the action log — is what explains a screenshot flake; the pixels are
        // already attached as -actual.png, -expected.png and -diff.png.
        trace: { mode: 'retain-on-failure', screenshots: false },
        contextOptions: {
            deviceScaleFactor: 2,
            reducedMotion: 'reduce',
            viewport
        }
    }
});
