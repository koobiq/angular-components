import { expect, Page, test } from '@playwright/test';
import { e2eEnableDarkTheme } from 'packages/e2e/utils';

test.describe('KbqTableModule', () => {
    test.fixme('E2eTableStates', () => {
        const getComponent = (page: Page) => page.getByTestId('e2eTableStates');

        test('light theme', async ({ page }) => {
            await page.goto('/E2eTableStates');
            await expect(getComponent(page)).toHaveScreenshot();
        });

        test('dark theme', async ({ page }) => {
            await page.goto('/E2eTableStates');
            await e2eEnableDarkTheme(page);
            await expect(getComponent(page)).toHaveScreenshot();
        });
    });
});
