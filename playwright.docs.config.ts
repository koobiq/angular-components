import { defineConfig, devices, ViewportSize } from '@playwright/test';

/**
 * Playwright config for the documentation site.
 *
 * Kept separate from `playwright.config.ts` because the two suites need different servers: the
 * component suite runs against the `dev-e2e` app, while these specs run against the prerendered
 * docs build (`yarn run docs:build`). This is a functional smoke — no visual snapshots — so it is
 * safe to run on any platform, unlike the component suite's Linux-only baselines.
 */
const isCI = !!process.env.CI;
const viewport: ViewportSize = {
    width: 1280,
    height: 900
};
const baseURL = process.env.DOCS_BASE_URL || 'http://localhost:4300';

export default defineConfig({
    testDir: 'apps/docs',
    testMatch: ['**/*.playwright-spec.ts'],
    tsconfig: 'tsconfig.playwright-spec.json',
    timeout: 30 * 1000,
    fullyParallel: true,
    forbidOnly: isCI,
    retries: isCI ? 2 : 0,
    reporter: [
        ['list', { printSteps: true }],
        ['html', { open: 'never', outputFolder: 'playwright-report-docs' }]
    ],
    projects: [
        {
            name: 'Chrome',
            use: {
                ...devices['Desktop Chrome'],
                viewport
            }
        }
    ],
    webServer: {
        command: 'node tools/serve-docs.mjs',
        url: baseURL,
        timeout: 2 * 60 * 1000,
        reuseExistingServer: !isCI
    },
    use: {
        baseURL,
        trace: 'on-first-retry',
        contextOptions: {
            reducedMotion: 'reduce',
            viewport
        }
    }
});
