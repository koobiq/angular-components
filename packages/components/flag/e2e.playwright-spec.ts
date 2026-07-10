import { expect, Page, test } from '@playwright/test';
import { e2eEnableDarkTheme } from 'packages/e2e/utils';

test.describe('KbqFlagModule', () => {
    test.describe('E2eFlagStyles', () => {
        const getComponent = (page: Page) => page.getByTestId('e2eFlagStyles');

        test('styles', async ({ page }) => {
            await page.goto('/E2eFlagStyles');
            await expect(getComponent(page)).toHaveScreenshot('01-light.png');
            await e2eEnableDarkTheme(page);
            await expect(getComponent(page)).toHaveScreenshot('01-dark.png');
        });
    });
});
