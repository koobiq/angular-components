import { expect, Page, test } from '@playwright/test';
import { e2eEnableDarkTheme } from '../../e2e/utils';

test.describe('KbqDlModule', () => {
    test.describe('E2eDlStates', () => {
        const getComponent = (page: Page) => page.getByTestId('e2eDlStates');

        test('states', async ({ page }) => {
            await page.goto('/E2eDlStates');
            await expect(getComponent(page)).toHaveScreenshot('01-light.png');
            await e2eEnableDarkTheme(page);
            await expect(getComponent(page)).toHaveScreenshot('01-dark.png');
        });
    });
});
