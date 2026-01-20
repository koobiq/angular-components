import { expect, Page, test } from '@playwright/test';
import { e2eEnableDarkTheme } from '../../e2e/utils';

test.describe('KbqProgressSpinnerModule', () => {
    test.describe('E2eProgressSpinnerStates', () => {
        const getComponent = (page: Page) => page.getByTestId('e2eProgressSpinnerStates');

        test('states', async ({ page }) => {
            await page.goto('/E2eProgressSpinnerStates');

            await page.waitForTimeout(50);

            await expect(getComponent(page)).toHaveScreenshot('01-light.png');
            await e2eEnableDarkTheme(page);
            await expect(getComponent(page)).toHaveScreenshot('01-dark.png');
        });
    });
});
