import { expect, Page, test } from '@playwright/test';
import { e2eEnableDarkTheme } from 'packages/e2e/utils';

test.describe('KbqLoaderOverlayModule', () => {
    test.describe('E2eLoaderOverlayStates', () => {
        const getComponent = (page: Page) => page.getByTestId('e2eLoaderOverlayStates');

        test('states', async ({ page }) => {
            await page.goto('/E2eLoaderOverlayStates');
            await expect(getComponent(page)).toHaveScreenshot('01-light.png');
            await e2eEnableDarkTheme(page);
            await expect(getComponent(page)).toHaveScreenshot('01-dark.png');
        });
    });

    test.describe('E2eLoaderOverlayCard', () => {
        const getComponent = (page: Page) => page.getByTestId('e2eLoaderOverlayCard');
        const getOpenButton = (page: Page) => page.getByTestId('e2eOpenModalWithLoader');

        test('card', async ({ page }) => {
            await page.setViewportSize({ width: 400, height: 500 });
            await page.goto('/E2eLoaderOverlayCard');
            const component = getComponent(page);

            await component.scrollIntoViewIfNeeded();
            await getOpenButton(page).click();
            await expect(component).toHaveScreenshot('02-light.png');
            await e2eEnableDarkTheme(page);
            await expect(component).toHaveScreenshot('02-dark.png');
        });
    });
});
