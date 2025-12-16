import { expect, Locator, Page, test } from '@playwright/test';
import { e2eEnableDarkTheme, e2eGoToRootPage } from '../../e2e/utils';

test.describe('KbqSplitButtonModule', () => {
    test.describe('E2eSplitButtonStateAndStyle', () => {
        const getComponent = (page: Page) => page.getByTestId('e2eSplitButtonStateAndStyle');
        const togglePrefix = (locator: Locator) => locator.getByTestId('e2eShowPrefixIcon').click();
        const toggleTitle = (locator: Locator) => locator.getByTestId('e2eShowTitle').click();
        const getScreenshotTarget = (locator: Locator) => locator.getByTestId('e2eScreenshotTarget');

        test('split-button with title', async ({ page }) => {
            await e2eGoToRootPage(page);
            const locator = getComponent(page);

            await expect(getScreenshotTarget(locator)).toHaveScreenshot();
        });

        test('split-button with icon', async ({ page }) => {
            await e2eGoToRootPage(page);
            const locator = getComponent(page);

            await togglePrefix(locator);
            await toggleTitle(locator);

            await expect(getScreenshotTarget(locator)).toHaveScreenshot();
        });

        test('split-button with title, prefix', async ({ page }) => {
            await e2eGoToRootPage(page);
            const locator = getComponent(page);

            await togglePrefix(locator);

            await expect(getScreenshotTarget(locator)).toHaveScreenshot();
        });

        test('split-button with title, prefix (dark theme)', async ({ page }) => {
            await e2eGoToRootPage(page);
            await e2eEnableDarkTheme(page);

            const locator = getComponent(page);

            await togglePrefix(locator);

            await expect(getScreenshotTarget(locator)).toHaveScreenshot();
        });
    });
});
