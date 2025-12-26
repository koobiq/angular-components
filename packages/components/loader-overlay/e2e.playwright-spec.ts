import { expect, Page, test } from '@playwright/test';
import { e2eEnableDarkTheme, e2eGoToRootPage } from 'packages/e2e/utils';

test.describe('KbqLoaderOverlayModule', () => {
    test.describe('E2eLoaderOverlayStates', () => {
        const getComponent = (page: Page) => page.getByTestId('e2eLoaderOverlayStates');

        test('light theme', async ({ page }) => {
            await e2eGoToRootPage(page);
            await expect(getComponent(page)).toHaveScreenshot();
        });

        test('dark theme', async ({ page }) => {
            await e2eGoToRootPage(page);
            await e2eEnableDarkTheme(page);
            await expect(getComponent(page)).toHaveScreenshot();
        });
    });
});
