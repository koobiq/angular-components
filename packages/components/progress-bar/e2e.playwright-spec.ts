import { expect, Locator, Page, test } from '@playwright/test';
import { e2eEnableDarkTheme } from '../../e2e/utils';

test.describe('KbqProgressBar', () => {
    test.describe('E2eProgressBarStateAndStyle', () => {
        const getComponent = (page: Page) => page.getByTestId('e2eProgressBarStateAndStyle');
        const getTestTable = (locator: Locator) => locator.getByTestId('e2eProgressBarTable');

        test('states', async ({ page }) => {
            await page.goto('/E2eProgressBarStateAndStyle');
            const locator = getComponent(page);
            const screenshotTarget = getTestTable(locator);

            await page.waitForTimeout(50);

            await expect(screenshotTarget).toHaveScreenshot('01-light.png');
            await e2eEnableDarkTheme(page);
            await expect(screenshotTarget).toHaveScreenshot('01-dark.png');
        });
    });
});
