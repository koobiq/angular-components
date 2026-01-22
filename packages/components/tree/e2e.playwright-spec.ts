import { expect, Page, test } from '@playwright/test';
import { e2eEnableDarkTheme } from '../../e2e/utils';

test.describe('KbqTreeModule', () => {
    test.describe('E2eTreeStates', () => {
        const getComponent = (page: Page) => page.getByTestId('e2eTreeStates');

        test('states', async ({ page }) => {
            await page.goto('/E2eTreeStates');

            await expect(getComponent(page)).toHaveScreenshot('01-light.png');
            await e2eEnableDarkTheme(page);
            await expect(getComponent(page)).toHaveScreenshot('01-dark.png');
        });
    });
});
