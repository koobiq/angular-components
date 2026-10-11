import { expect, Locator, Page, test } from '@playwright/test';
import { e2eEnableDarkTheme } from '../../e2e/utils';

test.describe('KbqNotificationCenterModule', () => {
    test.describe('E2eNotificationCenterStates', () => {
        const getComponent = (page: Page) => page.getByTestId('e2eNotificationCenterStates');
        const getScreenshotTarget = (locator: Locator) => locator.getByTestId('e2eScreenshotTarget');

        test('states', async ({ page }) => {
            await page.goto('/E2eNotificationCenterStates');
            const locator = getComponent(page);

            await expect(getScreenshotTarget(locator)).toHaveScreenshot('01-light.png');
            await e2eEnableDarkTheme(page);
            await expect(getScreenshotTarget(locator)).toHaveScreenshot('01-dark.png');
        });

        test('the title keeps its wrapping once the notification is read', async ({ page }) => {
            await page.goto('/E2eNotificationCenterStates');

            const item = page.getByTestId('kbq-notification-item').first();
            const title = item.locator('.kbq-notification-item__title > p');
            const titleBefore = await title.boundingBox();
            const itemBefore = await item.boundingBox();

            await title.click();
            await expect(item.locator('.kbq-notification-item-time')).toHaveClass(/kbq-notification-item-time_read/);

            expect((await title.boundingBox())?.width).toBe(titleBefore?.width);
            expect((await item.boundingBox())?.height).toBe(itemBefore?.height);
        });
    });
});
