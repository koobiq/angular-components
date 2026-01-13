import { expect, Locator, Page, test } from '@playwright/test';
import { e2eEnableDarkTheme } from '../../e2e/utils';

test.describe('KbqAccordionModule', () => {
    test.describe('E2eAccordionStates', () => {
        const getComponent = (page: Page) => page.getByTestId('e2eAccordionStates');
        const getScreenshotTarget = (locator: Locator) => locator.getByTestId('e2eScreenshotTarget');

        test('accordion default', async ({ page }) => {
            await page.goto('/E2eAccordionStates');
            const locator = getComponent(page);

            await expect(getScreenshotTarget(locator)).toHaveScreenshot();
        });

        test('accordion (dark theme)', async ({ page }) => {
            await page.goto('/E2eAccordionStates');
            await e2eEnableDarkTheme(page);

            const locator = getComponent(page);

            await expect(getScreenshotTarget(locator)).toHaveScreenshot();
        });
    });
});
