import { expect, Locator, Page, test } from '@playwright/test';
import { e2eEnableDarkTheme } from '../../e2e/utils';

test.describe('KbqListModule', () => {
    test.describe('E2eListStates', () => {
        const getComponent = (page: Page) => page.getByTestId('e2eListStates');
        const getScreenshotTarget = (locator: Locator) => locator.getByTestId('e2eScreenshotTarget');

        test('states', async ({ page }) => {
            await page.goto('/E2eListStates');
            const locator = getComponent(page);

            await expect(getScreenshotTarget(locator)).toHaveScreenshot('01-light.png');
            await e2eEnableDarkTheme(page);
            await expect(getScreenshotTarget(locator)).toHaveScreenshot('01-dark.png');
        });
    });

    test.describe('E2eListSelectionState', () => {
        const getComponent = (page: Page) => page.getByTestId('e2eListSelectionState');

        test('selected disabled option', async ({ page }) => {
            await page.goto('/E2eListSelectionState');
            const component = getComponent(page);

            await expect(component).toHaveScreenshot('02-light.png');
        });
    });
});
