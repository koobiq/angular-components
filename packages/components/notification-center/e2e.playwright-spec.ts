import { expect, Locator, Page, test } from '@playwright/test';
import { e2eEnableDarkTheme, e2eWaitForFonts } from '../../e2e/utils';

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
            await e2eWaitForFonts(page);

            const item = page.getByTestId('kbq-notification-item').first();
            const title = item.getByTestId('kbq-notification-item-title');
            const time = item.getByTestId('kbq-notification-item-time');
            const timeValue = time.getByTestId('kbq-notification-item-time-value');
            const titleBefore = await title.boundingBox();
            const itemBefore = await item.boundingBox();
            const timeValueBefore = await timeValue.boundingBox();

            await title.click();
            await expect(time).toHaveClass(/kbq-notification-item-time_read/);

            expect((await title.boundingBox())?.width).toBe(titleBefore?.width);
            expect((await item.boundingBox())?.height).toBe(itemBefore?.height);
            // The hidden dot moves before the time, which takes the dot's place at the edge.
            expect((await timeValue.boundingBox())!.x).toBeGreaterThan(timeValueBefore!.x);
        });
    });
});
