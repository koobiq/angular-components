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
});
