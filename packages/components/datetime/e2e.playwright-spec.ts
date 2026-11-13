import { expect, Locator, Page, test } from '@playwright/test';
import { e2eEnableDarkTheme } from '../../e2e/utils';

test.describe('KbqDatetime', () => {
    const getScreenshotTarget = (page: Page): Locator => page.getByTestId('e2eScreenshotTarget');

    test.describe('E2eDatetimeStates', () => {
        const getDateInput = (page: Page): Locator => page.getByTestId('e2eDatetimeEmpty').locator('input').first();
        const getTimeInput = (page: Page): Locator => page.getByTestId('e2eDatetimeEmpty').locator('input').last();

        test('states', async ({ page }) => {
            await page.goto('/E2eDatetimeStates');
            await expect(getScreenshotTarget(page)).toHaveScreenshot('01-light.png');
            await e2eEnableDarkTheme(page);
            await expect(getScreenshotTarget(page)).toHaveScreenshot('01-dark.png');
        });

        test('should fill the date and the time typed in one go', async ({ page }) => {
            await page.goto('/E2eDatetimeStates');

            await getDateInput(page).click();
            await page.keyboard.type('11112026', { delay: 50 });

            await expect(getDateInput(page)).toHaveValue('11.11.2026');
            await expect(getTimeInput(page)).toHaveValue('00:00');
            await expect(getTimeInput(page)).toBeFocused();

            await page.keyboard.type('2035', { delay: 50 });

            await expect(getTimeInput(page)).toHaveValue('20:35');
        });

        test('should move between the date and the time with the arrow keys', async ({ page }) => {
            await page.goto('/E2eDatetimeStates');

            await getDateInput(page).click();
            await page.keyboard.type('11112026', { delay: 50 });
            await expect(getTimeInput(page)).toBeFocused();

            await page.keyboard.press('ArrowLeft');
            await expect(getDateInput(page)).toBeFocused();

            await page.keyboard.press('ArrowRight');
            await expect(getTimeInput(page)).toBeFocused();
        });
    });

    test.describe('E2eDatetimeFocused', () => {
        test('focused', async ({ page }) => {
            await page.goto('/E2eDatetimeFocused');
            await expect(getScreenshotTarget(page)).toHaveScreenshot('02-focused-light.png');
            await e2eEnableDarkTheme(page);
            await expect(getScreenshotTarget(page)).toHaveScreenshot('02-focused-dark.png');
        });
    });
});
