import { expect, Locator, Page, test } from '@playwright/test';
import { devEnableDarkTheme, devGoToRootPage } from '../utils';

test.describe('KbqTagModule', () => {
    test.describe('DevTagStateAndStyle', () => {
        const getComponent = (page: Page): Locator => page.getByTestId('e2eTagStateAndStyle');
        const getScreenshotTarget = (locator: Locator): Locator => locator.getByTestId('e2eScreenshotTarget');

        test('states', async ({ page }) => {
            await devGoToRootPage(page);
            await expect(getScreenshotTarget(getComponent(page))).toHaveScreenshot();
        });

        test('states (dark theme)', async ({ page }) => {
            await devGoToRootPage(page);
            await devEnableDarkTheme(page);
            await expect(getScreenshotTarget(getComponent(page))).toHaveScreenshot();
        });
    });
});
