import { expect, Page, test } from '@playwright/test';
import { e2eEnableDarkTheme } from 'packages/e2e/utils';

test.describe('KbqTableModule', () => {
    test.describe('E2eTableStates', () => {
        const getComponent = (page: Page) => page.getByTestId('e2eTableStates');

        test('states', async ({ page }) => {
            await page.goto('/E2eTableStates');
            await expect(getComponent(page)).toHaveScreenshot('01-light.png');
            await e2eEnableDarkTheme(page);
            await expect(getComponent(page)).toHaveScreenshot('01-dark.png');
        });
    });
});
