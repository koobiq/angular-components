import { expect, Locator, Page, test } from '@playwright/test';
import { e2eEnableDarkTheme } from '../../e2e/utils';

test.describe('KbqIconModule', () => {
    test.describe('E2eIconStateAndStyle', () => {
        const getComponent = (page: Page) => page.getByTestId('e2eIconStateAndStyle');
        const getTestTable = (locator: Locator) => locator.getByTestId('e2eIconTable');

        test('states', async ({ page }) => {
            await page.goto('/E2eIconStateAndStyle');
            const locator = getComponent(page);
            const screenshotTarget = getTestTable(locator);

            await expect(screenshotTarget).toHaveScreenshot('01-light.png');
            await e2eEnableDarkTheme(page);
            await expect(screenshotTarget).toHaveScreenshot('01-dark.png');
        });
    });
});
