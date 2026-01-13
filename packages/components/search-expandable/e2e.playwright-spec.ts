import { expect, Locator, Page, test } from '@playwright/test';
import { e2eEnableDarkTheme } from '../../e2e/utils';

test.describe('KbqSearchExpandableModule', () => {
    test.describe('E2eSearchExpandableStates', () => {
        const getComponent = (page: Page) => page.getByTestId('e2eSearchExpandableStates');
        const getScreenshotTarget = (locator: Locator) => locator.getByTestId('e2eScreenshotTarget');

        test('search-expandable default', async ({ page }) => {
            await page.goto('/E2eSearchExpandableStates');
            const locator = getComponent(page);

            await expect(getScreenshotTarget(locator)).toHaveScreenshot();
        });

        test('search-expandable (dark theme)', async ({ page }) => {
            await page.goto('/E2eSearchExpandableStates');
            await e2eEnableDarkTheme(page);

            const locator = getComponent(page);

            await expect(getScreenshotTarget(locator)).toHaveScreenshot();
        });
    });
});
