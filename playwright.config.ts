import { defineConfig, devices, ViewportSize } from '@playwright/test';

const isCI = !!process.env.CI;

const VIEWPORT: ViewportSize = {
    width: 1280,
    height: 720
};

const BASE_URL: string = process.env.BASE_URL || 'http://localhost:4200';

/** @see https://playwright.dev/docs/test-configuration */
export default defineConfig({
    testDir: __dirname,
    testMatch: ['**/*.playwright-spec.ts'],
    fullyParallel: true,
    forbidOnly: isCI,
    retries: isCI ? 2 : 0,
    workers: isCI ? 1 : undefined,
    reporter: process.env.CI ? [['github']] : [['line'], ['html', { open: 'on-failure' }]],
    use: {
        baseURL: BASE_URL,
        trace: 'on-first-retry',
        viewport: VIEWPORT
    },
    projects: [
        {
            name: 'chromium',
            use: {
                ...devices['Desktop Chrome HiDPI'],
                viewport: VIEWPORT
            }
        }
    ],
    expect: {
        toHaveScreenshot: {
            animations: 'disabled',
            pathTemplate: '{testFileDir}/__screenshots__/{arg}{ext}'
        }
    }
});
