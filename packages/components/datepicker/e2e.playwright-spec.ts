import { expect, Locator, Page, test } from '@playwright/test';
import { e2eEnableDarkTheme } from '../../e2e/utils';

test.describe('KbqDatepickerModule', () => {
    test.describe('E2eDatepickerStates', () => {
        const getComponent = (page: Page) => page.getByTestId('e2eDatepickerStates');
        const getScreenshotTarget = (locator: Locator) => locator.getByTestId('e2eScreenshotTarget');

        test('datepicker default', async ({ page }) => {
            await page.goto('/E2eDatepickerStates');

            await page.getByTestId('e2eDatepickerToggle').click();

            const locator = getComponent(page);

            await expect(getScreenshotTarget(locator)).toHaveScreenshot();
        });

        test('datepicker (dark theme)', async ({ page }) => {
            await page.goto('/E2eDatepickerStates');
            await e2eEnableDarkTheme(page);

            await page.getByTestId('e2eDatepickerToggle').click();

            const locator = getComponent(page);

            await expect(getScreenshotTarget(locator)).toHaveScreenshot();
        });
    });
});
