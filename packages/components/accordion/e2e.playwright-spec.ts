import { expect, Locator, Page, test } from '@playwright/test';
import { devEnableDarkTheme, devGoToRootPage } from '../../e2e/utils';

test.describe('KbqAccordionModule', () => {
    test.describe('E2eAccordionStates', () => {
        const getComponent = (page: Page) => page.getByTestId('e2eAccordionStates');
        const getScreenshotTarget = (locator: Locator) => locator.getByTestId('e2eScreenshotTarget');

        test('accordion default', async ({ page }) => {
            await devGoToRootPage(page);
            const locator = getComponent(page);

            await expect(getScreenshotTarget(locator)).toHaveScreenshot();
        });

        test('accordion (dark theme)', async ({ page }) => {
            await devGoToRootPage(page);
            await devEnableDarkTheme(page);

            const locator = getComponent(page);

            await expect(getScreenshotTarget(locator)).toHaveScreenshot();
        });
    });
});
