import { expect, Locator, Page, test } from '@playwright/test';
import { e2eEnableDarkTheme } from '../../e2e/utils';

test.describe('KbqAppSwitcherModule', () => {
    test.describe('E2eAppSwitcherStates', () => {
        const getComponent = (page: Page) => page.getByTestId('e2eAppSwitcherStates');
        const getScreenshotTarget = (locator: Locator) => locator.getByTestId('e2eScreenshotTarget');

        test('AppSwitcher default', async ({ page }) => {
            await page.goto('/E2eAppSwitcherStates');

            const locator = getComponent(page);

            await expect(getScreenshotTarget(locator)).toHaveScreenshot();
        });

        test('AppSwitcher (dark theme)', async ({ page }) => {
            await page.goto('/E2eAppSwitcherStates');
            await e2eEnableDarkTheme(page);

            const locator = getComponent(page);

            await expect(getScreenshotTarget(locator)).toHaveScreenshot();
        });
    });

    test.describe('E2eAppSwitcherWithSitesStates', () => {
        const getComponent = (page: Page) => page.getByTestId('e2eAppSwitcherWithSitesStates');
        const getScreenshotTarget = (locator: Locator) => locator.getByTestId('e2eScreenshotTarget');

        test('AppSwitcher default', async ({ page }) => {
            await page.goto('/E2eAppSwitcherWithSitesStates');

            const locator = getComponent(page);

            await expect(getScreenshotTarget(locator)).toHaveScreenshot();
        });

        test('AppSwitcher (dark theme)', async ({ page }) => {
            await page.goto('/E2eAppSwitcherWithSitesStates');
            await e2eEnableDarkTheme(page);

            const locator = getComponent(page);

            await expect(getScreenshotTarget(locator)).toHaveScreenshot();
        });
    });
});
