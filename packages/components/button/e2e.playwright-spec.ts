import { expect, Locator, Page, test } from '@playwright/test';
import { e2eEnableDarkTheme } from '../../e2e/utils';

test.describe('KbqButtonModule', () => {
    test.describe('E2eButtonStateAndStyle', () => {
        const getComponent = (page: Page) => page.getByTestId('e2eButtonStateAndStyle');
        const togglePrefix = (locator: Locator) => locator.getByTestId('e2eShowPrefixIcon').click();
        const toggleTitle = (locator: Locator) => locator.getByTestId('e2eShowTitle').click();
        const toggleSuffix = (locator: Locator) => locator.getByTestId('e2eShowSuffixIcon').click();
        const getScreenshotTarget = (locator: Locator) => locator.getByTestId('e2eScreenshotTarget');

        test('with title', async ({ page }) => {
            await page.goto('/E2eButtonStateAndStyle');
            const locator = getComponent(page);

            await expect(getScreenshotTarget(locator)).toHaveScreenshot('01-light.png');
        });

        test('with icon', async ({ page }) => {
            await page.goto('/E2eButtonStateAndStyle');
            const locator = getComponent(page);

            await togglePrefix(locator);
            await toggleTitle(locator);

            await expect(getScreenshotTarget(locator)).toHaveScreenshot('02-light.png');
        });

        test('with title, prefix and suffix', async ({ page }) => {
            await page.goto('/E2eButtonStateAndStyle');
            const locator = getComponent(page);

            await togglePrefix(locator);
            await toggleSuffix(locator);

            await expect(getScreenshotTarget(locator)).toHaveScreenshot('03-light.png');
            await e2eEnableDarkTheme(page);
            await expect(getScreenshotTarget(locator)).toHaveScreenshot('03-dark.png');
        });
    });
});
