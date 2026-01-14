import { expect, Locator, Page, test } from '@playwright/test';
import { e2eEnableDarkTheme } from '../../e2e/utils';

test.describe('KbqButtonToggleModule', () => {
    test.describe('E2eButtonToggleStates', () => {
        const getComponent = (page: Page) => page.getByTestId('e2eButtonToggleStates');
        const togglePrefix = (locator: Locator) => locator.getByTestId('e2eShowPrefixIcon').click();
        const toggleTitle = (locator: Locator) => locator.getByTestId('e2eShowTitle').click();
        const toggleSuffix = (locator: Locator) => locator.getByTestId('e2eShowSuffixIcon').click();
        const getScreenshotTarget = (locator: Locator) => locator.getByTestId('e2eScreenshotTarget');

        test('button-toggle with title', async ({ page }) => {
            await page.goto('/E2eButtonToggleStates');
            const locator = getComponent(page);

            await expect(getScreenshotTarget(locator)).toHaveScreenshot();
        });

        test('button-toggle with icon', async ({ page }) => {
            await page.goto('/E2eButtonToggleStates');
            const locator = getComponent(page);

            await togglePrefix(locator);
            await toggleTitle(locator);

            await expect(getScreenshotTarget(locator)).toHaveScreenshot();
        });

        test('button-toggle with title, prefix and suffix', async ({ page }) => {
            await page.goto('/E2eButtonToggleStates');
            const locator = getComponent(page);

            await togglePrefix(locator);
            await toggleSuffix(locator);

            await expect(getScreenshotTarget(locator)).toHaveScreenshot();
        });

        test('button-toggle with title, prefix and suffix (dark theme)', async ({ page }) => {
            await page.goto('/E2eButtonToggleStates');
            await e2eEnableDarkTheme(page);

            const locator = getComponent(page);

            await togglePrefix(locator);
            await toggleSuffix(locator);

            await expect(getScreenshotTarget(locator)).toHaveScreenshot();
        });
    });
});
