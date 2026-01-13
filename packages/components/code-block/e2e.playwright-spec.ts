import { expect, Page, test } from '@playwright/test';
import { e2eEnableDarkTheme } from 'packages/e2e/utils';

test.describe('KbqCodeBlockModule', () => {
    test.describe('E2eCodeBlockStates', () => {
        const getComponent = (page: Page) => page.getByTestId('e2eCodeBlockStates');

        test('light theme', async ({ page }) => {
            await page.goto('/E2eCodeBlockStates');
            await expect(getComponent(page)).toHaveScreenshot();
        });

        test('dark theme', async ({ page }) => {
            await page.goto('/E2eCodeBlockStates');
            await e2eEnableDarkTheme(page);
            await expect(getComponent(page)).toHaveScreenshot();
        });
    });
});
