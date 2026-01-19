import { expect, Locator, Page, test } from '@playwright/test';
import { e2eEnableDarkTheme } from 'packages/e2e/utils';

test.describe('KbqActionsPanel', () => {
    test.describe('E2eActionsPanelWithOverlayContainer', () => {
        test.use({ viewport: { width: 650, height: 200 } });

        const getComponent = (page: Page) => page.getByTestId('e2eActionsPanelWithOverlayContainer');
        const getOpenButton = (locator: Locator) => locator.getByTestId('e2eActionsPanelOpenButton');
        const getOverlayContainer = (locator: Locator) => locator.getByTestId('e2eActionsPanelOverlayContainer');
        const getScreenshotTarget = (locator: Locator) => getOverlayContainer(locator);
        const getOverflowItemsResultButton = (page: Page) =>
            page.getByTestId('e2eActionsPanelOverflowItemsResultButton');

        test('with custom container', async ({ page }) => {
            await page.goto('/E2eActionsPanelWithOverlayContainer');
            const locator = getComponent(page);

            await getOpenButton(locator).click();
            await expect(getScreenshotTarget(locator)).toHaveScreenshot('1-light.png');
        });

        test('items overflow and dropdown', async ({ page }) => {
            await page.goto('/E2eActionsPanelWithOverlayContainer');
            const locator = getComponent(page);
            const screenshotTarget = getScreenshotTarget(locator);

            await getOpenButton(locator).click();
            await getOverlayContainer(locator).evaluate(({ style }) => (style.width = '650px'));
            getOverflowItemsResultButton(page).click();
            await expect(screenshotTarget).toHaveScreenshot('2-light.png');
            await e2eEnableDarkTheme(page);
            await expect(screenshotTarget).toHaveScreenshot('2-dark.png');
        });
    });
});
