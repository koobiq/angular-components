import { expect, Locator, Page, test } from '@playwright/test';
import { devEnableDarkTheme, devGoToRootPage } from '../utils';

test.describe('KbqSplitButtonModule', () => {
    test.describe('DevSplitButtonStateAndStyle', () => {
        const getComponent = (page: Page) => page.getByTestId('e2eSplitButtonStateAndStyle');
        const togglePrefix = (locator: Locator) => locator.getByTestId('e2eShowPrefixIcon').click();
        const toggleTitle = (locator: Locator) => locator.getByTestId('e2eShowTitle').click();
        const getScreenshotTarget = (locator: Locator) => locator.getByTestId('e2eScreenshotTarget');

        test('split-button with title', async ({ page }) => {
            await devGoToRootPage(page);
            const locator = getComponent(page);

            await expect(getScreenshotTarget(locator)).toHaveScreenshot();
        });

        test('split-button with icon', async ({ page }) => {
            await devGoToRootPage(page);
            const locator = getComponent(page);

            await togglePrefix(locator);
            await toggleTitle(locator);

            await expect(getScreenshotTarget(locator)).toHaveScreenshot();
        });

        test('split-button with title, prefix', async ({ page }) => {
            await devGoToRootPage(page);
            const locator = getComponent(page);

            await togglePrefix(locator);

            await expect(getScreenshotTarget(locator)).toHaveScreenshot();
        });

        test('split-button with title, prefix (dark theme)', async ({ page }) => {
            await devGoToRootPage(page);
            await devEnableDarkTheme(page);

            const locator = getComponent(page);

            await togglePrefix(locator);

            await expect(getScreenshotTarget(locator)).toHaveScreenshot();
        });
    });
});
