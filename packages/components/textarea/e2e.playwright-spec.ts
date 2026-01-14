import { expect, Locator, Page, test } from '@playwright/test';
import { e2eEnableDarkTheme } from '../../e2e/utils';

test.describe('KbqTextareaModule', () => {
    test.describe('E2eTextareaStates', () => {
        const getComponent = (page: Page): Locator => page.getByTestId('e2eTextareaStates');

        test('light theme', async ({ page }) => {
            await page.goto('/E2eTextareaStates');
            await expect(getComponent(page)).toHaveScreenshot();
        });

        test('dark theme', async ({ page }) => {
            await page.goto('/E2eTextareaStates');
            await e2eEnableDarkTheme(page);
            await expect(getComponent(page)).toHaveScreenshot();
        });
    });
});
