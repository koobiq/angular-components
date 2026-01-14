import { expect, Locator, Page, test } from '@playwright/test';
import { e2eEnableDarkTheme } from '../../e2e/utils';

test.describe('KbqToastModule', () => {
    test.describe('E2eToastStates', () => {
        const getComponent = (page: Page) => page.getByTestId('e2eToastStates');
        const getScreenshotTarget = (locator: Locator) => locator.getByTestId('e2eScreenshotTarget');

        test('toast default', async ({ page }) => {
            await page.goto('/E2eToastStates');
            const locator = getComponent(page);

            await expect(getScreenshotTarget(locator)).toHaveScreenshot();
        });

        test('toast (dark theme)', async ({ page }) => {
            await page.goto('/E2eToastStates');
            await e2eEnableDarkTheme(page);

            const locator = getComponent(page);

            await expect(getScreenshotTarget(locator)).toHaveScreenshot();
        });
    });
});
