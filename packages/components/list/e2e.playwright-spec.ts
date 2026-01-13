import { expect, Locator, Page, test } from '@playwright/test';
import { e2eEnableDarkTheme } from '../../e2e/utils';

test.describe('KbqListModule', () => {
    test.describe('E2eListStates', () => {
        const getComponent = (page: Page) => page.getByTestId('e2eListStates');
        const getScreenshotTarget = (locator: Locator) => locator.getByTestId('e2eScreenshotTarget');

        test('list default', async ({ page }) => {
            await page.goto('/E2eListStates');
            const locator = getComponent(page);

            await expect(getScreenshotTarget(locator)).toHaveScreenshot();
        });

        test('list (dark theme)', async ({ page }) => {
            await page.goto('/E2eListStates');
            await e2eEnableDarkTheme(page);

            const locator = getComponent(page);

            await expect(getScreenshotTarget(locator)).toHaveScreenshot();
        });
    });
});
