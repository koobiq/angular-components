import { expect, Locator, Page, test } from '@playwright/test';
import { e2eEnableDarkTheme } from '../../e2e/utils';

test.describe('KbqMarkdownModule', () => {
    test.describe('E2eMarkdownStates', () => {
        const getComponent = (page: Page) => page.getByTestId('e2eMarkdownStates');
        const getScreenshotTarget = (locator: Locator) => locator.getByTestId('e2eScreenshotTarget');

        test('Markdown default', async ({ page }) => {
            await page.goto('/E2eMarkdownStates');
            const locator = getComponent(page);

            await expect(getScreenshotTarget(locator)).toHaveScreenshot();
        });

        test('Markdown (dark theme)', async ({ page }) => {
            await page.goto('/E2eMarkdownStates');
            await e2eEnableDarkTheme(page);

            const locator = getComponent(page);

            await expect(getScreenshotTarget(locator)).toHaveScreenshot();
        });
    });
});
