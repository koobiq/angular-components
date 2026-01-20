import { expect, Locator, Page, test } from '@playwright/test';
import { e2eEnableDarkTheme } from '../../e2e/utils';

test.describe('KbqEmptyStateModule', () => {
    test.describe('E2eEmptyStateStateAndStyle', () => {
        const getComponent = (page: Page) => page.getByTestId('e2eEmptyStateStateAndStyle');
        const getTestTable = (locator: Locator) => locator.getByTestId('e2eEmptyStateTable');

        test('states', async ({ page }) => {
            await page.goto('/E2eEmptyStateStateAndStyle');
            const locator = getComponent(page);
            const screenshotTarget = getTestTable(locator);

            await expect(screenshotTarget).toHaveScreenshot('01-light.png');
            await e2eEnableDarkTheme(page);
            await expect(screenshotTarget).toHaveScreenshot('01-dark.png');
        });
    });
});
