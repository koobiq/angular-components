import { defineConfig, devices, ViewportSize } from '@playwright/test';

const isCI = !!process.env.CI;
const viewport: ViewportSize = {
    width: 1200,
    height: 720
};
const baseURL = process.env.BASE_URL || 'http://localhost:4200';
const webServerCommand = process.env.WEB_SERVER_COMMAND || 'yarn run dev:e2e --configuration=production';

/** @see https://playwright.dev/docs/test-configuration */
export default defineConfig({
    testDir: __dirname,
    testMatch: ['**/*.playwright-spec.ts'],
    tsconfig: 'tsconfig.playwright-spec.json',
    timeout: 15 * 1000,
    fullyParallel: true,
    forbidOnly: isCI,
    retries: isCI ? 2 : 0,
    workers: isCI ? 1 : undefined,
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
        toHaveScreenshot: {
            pathTemplate: '{testFileDir}/__screenshots__/{arg}{ext}',
            threshold: 0.2,
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
        trace: 'on-first-retry',
        contextOptions: {
            deviceScaleFactor: 2,
            reducedMotion: 'reduce',
            viewport
        }
    }
});
