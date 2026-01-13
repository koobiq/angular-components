import { expect, Locator, Page, test } from '@playwright/test';
import { e2eEnableDarkTheme } from '../../e2e/utils';

test.describe('KbqTimepickerModule', () => {
    test.describe('E2eTimepickerStates', () => {
        const getComponent = (page: Page): Locator => page.getByTestId('e2eTimepickerStates');

        test('light theme', async ({ page }) => {
            await page.goto('/E2eTimepickerStates');
            await expect(getComponent(page)).toHaveScreenshot();
        });

        test('dark theme', async ({ page }) => {
            await page.goto('/E2eTimepickerStates');
            await e2eEnableDarkTheme(page);
            await expect(getComponent(page)).toHaveScreenshot();
        });
    });
});
