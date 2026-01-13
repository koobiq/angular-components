import { expect, Page, test } from '@playwright/test';
import { e2eEnableDarkTheme } from '../../e2e/utils';

test.describe('KbqDlModule', () => {
    test.describe('E2eDlStates', () => {
        const getComponent = (page: Page) => page.getByTestId('e2eDlStates');

        test('light theme', async ({ page }) => {
            await page.goto('/E2eDlStates');
            await expect(getComponent(page)).toHaveScreenshot();
        });

        test('dark theme', async ({ page }) => {
            await page.goto('/E2eDlStates');
            await e2eEnableDarkTheme(page);
            await expect(getComponent(page)).toHaveScreenshot();
        });
    });
});
