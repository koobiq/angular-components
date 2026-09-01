import { expect, Locator, Page, test } from '@playwright/test';
import { e2eEnableDarkTheme, e2eWaitForSettledScrollbars } from '../../e2e/utils';

test.describe('KbqNotificationCenterModule', () => {
    test.describe('E2eNotificationCenterStates', () => {
        const getComponent = (page: Page) => page.getByTestId('e2eNotificationCenterStates');
        const getScreenshotTarget = (locator: Locator) => locator.getByTestId('e2eScreenshotTarget');

        test('states', async ({ page }) => {
            await page.goto('/E2eNotificationCenterStates');
            const locator = getComponent(page);

            // The centre scrolls itself to the bottom on init, which reveals the scrollbar track.
            await e2eWaitForSettledScrollbars(page);

            await expect(getScreenshotTarget(locator)).toHaveScreenshot('01-light.png');
            await e2eEnableDarkTheme(page);
            await expect(getScreenshotTarget(locator)).toHaveScreenshot('01-dark.png');
        });
    });
});
