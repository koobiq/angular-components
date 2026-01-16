import { expect, Locator, Page, test } from '@playwright/test';
import { e2eEnableDarkTheme } from '../../e2e/utils';

test.describe('KbqPopoverModule', () => {
    test.describe('E2ePopoverStates', () => {
        const getComponent = (page: Page) => page.getByTestId('e2ePopoverStates');
        const getScreenshotTarget = (locator: Locator) => locator.getByTestId('e2eScreenshotTarget');

        test('popover default', async ({ page }) => {
            await page.goto('/E2ePopoverStates');
            const locator = getComponent(page);

            await expect(getScreenshotTarget(locator)).toHaveScreenshot({ threshold: 0.05 });
        });

        test('popover (dark theme)', async ({ page }) => {
            await page.goto('/E2ePopoverStates');
            await e2eEnableDarkTheme(page);

            const locator = getComponent(page);

            await expect(getScreenshotTarget(locator)).toHaveScreenshot({ threshold: 0.05 });
        });
    });
});
