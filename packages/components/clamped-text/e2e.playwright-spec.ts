import { expect, Locator, Page, test } from '@playwright/test';
import { e2eEnableDarkTheme } from '../../e2e/utils';

test.describe('KbqClampedText', () => {
    test.describe('E2eClampedTextStateAndStyle', () => {
        const getComponent = (page: Page) => page.getByTestId('e2eClampedTextStateAndStyle');
        const getTestTable = (locator: Locator) => locator.getByTestId('e2eClampedTextTable');

        test('KbqClampedText states', async ({ page }) => {
            await page.goto('/E2eClampedTextStateAndStyle');
            const locator = getComponent(page);

            const screenshotTarget = getTestTable(locator);

            await expect(screenshotTarget).toHaveScreenshot();
        });

        test(`KbqClampedText states (dark theme)`, async ({ page }) => {
            await page.goto('/E2eClampedTextStateAndStyle');
            await e2eEnableDarkTheme(page);

            const locator = getComponent(page);

            const screenshotTarget = getTestTable(locator);

            await expect(screenshotTarget).toHaveScreenshot();
        });
    });
});
