import { expect, Locator, Page, test } from '@playwright/test';
import { e2eEnableDarkTheme } from '../../e2e/utils';

test.describe('KbqNavbarModule', () => {
    test.describe('E2eHorizontalNavbarStates', () => {
        const getComponent = (page: Page) => page.getByTestId('e2eNavbarStates');
        const getScreenshotTarget = (locator: Locator) => locator.getByTestId('e2eScreenshotTarget');

        test('navbar default', async ({ page }) => {
            await page.goto('/E2eHorizontalNavbarStates');
            const locator = getComponent(page);

            await expect(getScreenshotTarget(locator)).toHaveScreenshot();
        });

        test('navbar (dark theme)', async ({ page }) => {
            await page.goto('/E2eHorizontalNavbarStates');
            await e2eEnableDarkTheme(page);

            const locator = getComponent(page);

            await expect(getScreenshotTarget(locator)).toHaveScreenshot();
        });
    });

    test.describe('E2eVerticalNavbarStates', () => {
        const getComponent = (page: Page) => page.getByTestId('e2eVerticalNavbarStates');
        const getScreenshotTarget = (locator: Locator) => locator.getByTestId('e2eScreenshotTarget');

        test('vertical navbar default', async ({ page }) => {
            await page.goto('/E2eVerticalNavbarStates');
            const locator = getComponent(page);

            await expect(getScreenshotTarget(locator)).toHaveScreenshot();
        });

        test('vertical navbar (dark theme)', async ({ page }) => {
            await page.goto('/E2eVerticalNavbarStates');
            await e2eEnableDarkTheme(page);

            const locator = getComponent(page);

            await expect(getScreenshotTarget(locator)).toHaveScreenshot();
        });
    });
});
