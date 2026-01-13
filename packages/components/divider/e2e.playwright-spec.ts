import { expect, Locator, Page, test } from '@playwright/test';
import { e2eEnableDarkTheme } from '../../e2e/utils';

test.describe('KbqDivider', () => {
    test.describe('E2eDividerStateAndStyle', () => {
        const getComponent = (page: Page) => page.getByTestId('e2eDividerStateAndStyle');
        const getTestTable = (locator: Locator) => locator.getByTestId('e2eDividerTable');

        test('KbqDivider states', async ({ page }) => {
            await page.goto('/E2eDividerStateAndStyle');
            const locator = getComponent(page);

            const screenshotTarget = getTestTable(locator);

            await expect(screenshotTarget).toHaveScreenshot();
        });

        test(`KbqDivider states (dark theme)`, async ({ page }) => {
            await page.goto('/E2eDividerStateAndStyle');
            await e2eEnableDarkTheme(page);

            const locator = getComponent(page);

            const screenshotTarget = getTestTable(locator);

            await expect(screenshotTarget).toHaveScreenshot();
        });
    });
});
