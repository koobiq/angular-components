import { expect, Page, test } from '@playwright/test';
import { e2eEnableDarkTheme } from 'packages/e2e/utils';

test.fixme('KbqTabsModule', () => {
    test.describe('E2eTabsStates', () => {
        const getComponent = (page: Page) => page.getByTestId('e2eTabsStates');

        test('states', async ({ page }) => {
            await page.goto('/E2eTabsStates');
            await expect(getComponent(page)).toHaveScreenshot('01-light.png');
            await e2eEnableDarkTheme(page);
            await expect(getComponent(page)).toHaveScreenshot('01-dark.png');
        });
    });
});
