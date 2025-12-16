import { expect, Locator, Page, test } from '@playwright/test';
import { e2eEnableDarkTheme, e2eGoToRootPage } from '../../e2e/utils';

test.describe('KbqAppSwitcherModule', () => {
    test.describe('E2AppSwitcherStates', () => {
        const getComponent = (page: Page) => page.getByTestId('e2eAppSwitcherStates');
        const getScreenshotTarget = (locator: Locator) => locator.getByTestId('e2eScreenshotTarget');

        test('AppSwitcher default', async ({ page }) => {
            await e2eGoToRootPage(page);

            const locator = getComponent(page);

            await expect(getScreenshotTarget(locator)).toHaveScreenshot();
        });

        test('AppSwitcher (dark theme)', async ({ page }) => {
            await e2eGoToRootPage(page);
            await e2eEnableDarkTheme(page);

            const locator = getComponent(page);

            await expect(getScreenshotTarget(locator)).toHaveScreenshot();
        });
    });

    test.describe('E2AppSwitcherWithSitesStates', () => {
        const getComponent = (page: Page) => page.getByTestId('e2eAppSwitcherWithSitesStates');
        const getScreenshotTarget = (locator: Locator) => locator.getByTestId('e2eScreenshotTarget');

        test('AppSwitcher default', async ({ page }) => {
            await e2eGoToRootPage(page);

            const locator = getComponent(page);

            await expect(getScreenshotTarget(locator)).toHaveScreenshot();
        });

        test('AppSwitcher (dark theme)', async ({ page }) => {
            await e2eGoToRootPage(page);
            await e2eEnableDarkTheme(page);

            const locator = getComponent(page);

            await expect(getScreenshotTarget(locator)).toHaveScreenshot();
        });
    });
});
