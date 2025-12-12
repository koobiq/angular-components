import { expect, Locator, Page, test } from '@playwright/test';
import { devEnableDarkTheme, devGoToRootPage } from '../../e2e/utils';

test.describe('KbqFilterBarModule', () => {
    test.describe('E2eFilterBarStates', () => {
        const getComponent = (page: Page) => page.getByTestId('e2eFilterBarStates');
        const getScreenshotTarget = (locator: Locator) => locator.getByTestId('e2eScreenshotTarget');

        test('FilterBar default', async ({ page }) => {
            await devGoToRootPage(page);

            const locator = getComponent(page);

            await expect(getScreenshotTarget(locator)).toHaveScreenshot();
        });

        test('FilterBar (dark theme)', async ({ page }) => {
            await devGoToRootPage(page);
            await devEnableDarkTheme(page);

            const locator = getComponent(page);

            await expect(getScreenshotTarget(locator)).toHaveScreenshot();
        });
    });
});
