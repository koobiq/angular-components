import { expect, Locator, Page, test } from '@playwright/test';
import { e2eEnableDarkTheme } from '../../e2e/utils';

test.describe('KbqProgressBar', () => {
    test.describe('E2eProgressBarStateAndStyle', () => {
        const getComponent = (page: Page) => page.getByTestId('e2eProgressBarStateAndStyle');
        const getTestTable = (locator: Locator) => locator.getByTestId('e2eProgressBarTable');

        test('KbqProgressBar states', async ({ page }) => {
            await page.goto('/E2eProgressBarStateAndStyle');
            const locator = getComponent(page);

            const screenshotTarget = getTestTable(locator);

            await page.waitForTimeout(50);

            await expect(screenshotTarget).toHaveScreenshot();
        });

        test(`KbqProgressBar states (dark theme)`, async ({ page }) => {
            await page.goto('/E2eProgressBarStateAndStyle');
            await e2eEnableDarkTheme(page);

            const locator = getComponent(page);

            const screenshotTarget = getTestTable(locator);

            await page.waitForTimeout(50);

            await expect(screenshotTarget).toHaveScreenshot();
        });
    });
});
