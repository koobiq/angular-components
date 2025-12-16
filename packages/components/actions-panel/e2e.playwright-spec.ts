import { expect, Locator, Page, test } from '@playwright/test';
import { e2eEnableDarkTheme, e2eGoToRootPage } from '../../e2e/utils';

test.describe('KbqActionsPanel', () => {
    test.describe('DevActionsPanelWithOverlayContainer', () => {
        const getComponent = (page: Page) => page.getByTestId('e2eActionsPanelWithOverlayContainer');
        const getOpenButton = (locator: Locator) => locator.getByTestId('e2eActionsPanelOpenButton');
        const getOverlayContainer = (locator: Locator) => locator.getByTestId('e2eActionsPanelOverlayContainer');
        const getScreenshotTarget = (locator: Locator) => getOverlayContainer(locator);
        const getOverflowItemsResultButton = (page: Page) =>
            page.getByTestId('e2eActionsPanelOverflowItemsResultButton');

        test('should display the actions panel inside custom overlay container', async ({ page }) => {
            await e2eGoToRootPage(page);
            const locator = getComponent(page);

            await getOpenButton(locator).click();

            await expect(getScreenshotTarget(locator)).toHaveScreenshot();
        });

        test('should update the actions panel container position/size when overlay container is resized', async ({
            page
        }) => {
            await e2eGoToRootPage(page);
            const locator = getComponent(page);

            await getOpenButton(locator).click();
            await getOverlayContainer(locator).evaluate(({ style }) => (style.width = '600px'));

            await expect(getScreenshotTarget(locator)).toHaveScreenshot();
        });

        test('should show hidden actions when button is clicked', async ({ page }) => {
            await e2eGoToRootPage(page);
            const locator = getComponent(page);

            await e2eEnableDarkTheme(page);
            await getOpenButton(locator).click();
            await getOverlayContainer(locator).evaluate(({ style }) => (style.width = '600px'));
            await getOverflowItemsResultButton(page).click();

            await expect(getScreenshotTarget(locator)).toHaveScreenshot();
        });
    });
});
