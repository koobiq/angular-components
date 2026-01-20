import { expect, Page, test } from '@playwright/test';
import { e2eEnableDarkTheme } from 'packages/e2e/utils';

test.describe('KbqLinkModule', () => {
    test.describe('E2eLinkStates', () => {
        const getComponent = (page: Page) => page.getByTestId('e2eLinkStates');

        test('states', async ({ page }) => {
            await page.goto('/E2eLinkStates');
            await expect(getComponent(page)).toHaveScreenshot('01-light.png');
            await e2eEnableDarkTheme(page);
            await expect(getComponent(page)).toHaveScreenshot('01-dark.png');
        });
    });
});
