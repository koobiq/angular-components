import { expect, Locator, Page, test } from '@playwright/test';
import { e2eEnableDarkTheme } from '../../e2e/utils';

test.describe('KbqRadioModule', () => {
    test.describe('E2eRadioStateAndStyle', () => {
        const getComponent = (page: Page) => page.getByTestId('e2eRadioStateAndStyle');
        const getTestTable = (locator: Locator) => locator.getByTestId('e2eRadioTable');

        test('states', async ({ page }) => {
            await page.goto('/E2eRadioStateAndStyle');
            const locator = getComponent(page);
            const screenshotTarget = getTestTable(locator);

            await expect(screenshotTarget).toHaveScreenshot('01-light.png');
            await e2eEnableDarkTheme(page);
            await expect(screenshotTarget).toHaveScreenshot('01-dark.png');
        });
    });
});
