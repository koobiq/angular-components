import { expect, Page, test } from '@playwright/test';
import { e2eEnableDarkTheme } from 'packages/e2e/utils';

test.describe('KbqBadgeModule', () => {
    test.describe('E2eBadgeStyles', () => {
        const getComponent = (page: Page) => page.getByTestId('e2eBadgeStyles');

        test('styles', async ({ page }) => {
            await page.goto('/E2eBadgeStyles');
            await expect(getComponent(page)).toHaveScreenshot('01-light.png');
            await e2eEnableDarkTheme(page);
            await expect(getComponent(page)).toHaveScreenshot('01-dark.png');
        });
    });

    test.describe('E2eBadgeAsyncIcon', () => {
        const getComponent = (page: Page) => page.getByTestId('e2eBadgeAsyncIcon');

        test('adds icon spacing when the icon is projected asynchronously', async ({ page }) => {
            await page.goto('/E2eBadgeAsyncIcon');
            const locator = getComponent(page);

            await locator.getByTestId('e2eShowIcon').click();

            const icon = locator.locator('[kbq-icon]');
            const marginLeft = await icon.evaluate((element) => parseFloat(getComputedStyle(element).marginLeft));

            expect(marginLeft).toBe(4);
        });
    });
});
