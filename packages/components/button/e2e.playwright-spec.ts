import { expect, Locator, Page, test } from '@playwright/test';
import { e2eEnableDarkTheme, e2eGoToRootPage } from '../../e2e/utils';

test.describe('KbqButtonModule', () => {
    test.describe('E2eButtonStateAndStyle', () => {
        const getComponent = (page: Page) => page.getByTestId('e2eButtonStateAndStyle');
        const togglePrefix = (locator: Locator) => locator.getByTestId('e2eShowPrefixIcon').click();
        const toggleTitle = (locator: Locator) => locator.getByTestId('e2eShowTitle').click();
        const toggleSuffix = (locator: Locator) => locator.getByTestId('e2eShowSuffixIcon').click();
        const getScreenshotTarget = (locator: Locator) => locator.getByTestId('e2eScreenshotTarget');

        test('button with title', async ({ page }) => {
            await e2eGoToRootPage(page);
            const locator = getComponent(page);

            await expect(getScreenshotTarget(locator)).toHaveScreenshot();
        });

        test('button with icon', async ({ page }) => {
            await e2eGoToRootPage(page);
            const locator = getComponent(page);

            await togglePrefix(locator);
            await toggleTitle(locator);

            await expect(getScreenshotTarget(locator)).toHaveScreenshot();
        });

        test('button with title, prefix and suffix', async ({ page }) => {
            await e2eGoToRootPage(page);
            const locator = getComponent(page);

            await togglePrefix(locator);
            await toggleSuffix(locator);

            await expect(getScreenshotTarget(locator)).toHaveScreenshot();
        });

        test('button with title, prefix and suffix (dark theme)', async ({ page }) => {
            await e2eGoToRootPage(page);
            await e2eEnableDarkTheme(page);

            const locator = getComponent(page);

            await togglePrefix(locator);
            await toggleSuffix(locator);

            await expect(getScreenshotTarget(locator)).toHaveScreenshot();
        });
    });
});
