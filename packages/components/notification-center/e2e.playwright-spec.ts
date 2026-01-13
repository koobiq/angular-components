import { expect, Locator, Page, test } from '@playwright/test';
import { e2eEnableDarkTheme } from '../../e2e/utils';

test.describe('KbqNotificationCenterModule', () => {
    test.describe('E2eNotificationCenterStates', () => {
        const getComponent = (page: Page) => page.getByTestId('e2eNotificationCenterStates');
        const getScreenshotTarget = (locator: Locator) => locator.getByTestId('e2eScreenshotTarget');

        test('notification-center default', async ({ page }) => {
            await page.goto('/E2eNotificationCenterStates');
            const locator = getComponent(page);

            await expect(getScreenshotTarget(locator)).toHaveScreenshot();
        });

        test('notification-center (dark theme)', async ({ page }) => {
            await page.goto('/E2eNotificationCenterStates');
            await e2eEnableDarkTheme(page);

            const locator = getComponent(page);

            await expect(getScreenshotTarget(locator)).toHaveScreenshot();
        });
    });
});
