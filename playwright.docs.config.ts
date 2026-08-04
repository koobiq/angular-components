import { defineConfig, devices, ViewportSize } from '@playwright/test';
import baseConfig from './playwright.config';

/**
 * Playwright config for the documentation site.
 *
 * Derives from `playwright.config.ts` and overrides only what the two suites genuinely disagree on:
 * the component suite runs against the `dev-e2e` app, while these specs run against the prerendered
 * docs build (`yarn run docs:build`). This is a functional smoke — no visual snapshots — so it is
 * safe to run on any platform, unlike the component suite's Linux-only baselines.
 *
 * Spread rather than `defineConfig(baseConfig, {...})`: the multi-argument form *concatenates*
 * `webServer` entries, which would boot the `dev-e2e` server alongside the docs one.
 */
const isCI = !!process.env.CI;
const viewport: ViewportSize = {
    width: 1280,
    height: 900
};
const baseURL = process.env.DOCS_BASE_URL || 'http://localhost:4300';

export default defineConfig({
    ...baseConfig,
    testDir: 'apps/docs',
    // Hydration plus a lazily loaded example chunk outlasts the component suite's budget.
    timeout: 30 * 1000,
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
        ...baseConfig.use,
        baseURL,
        contextOptions: {
            reducedMotion: 'reduce',
            viewport
        }
    }
});
