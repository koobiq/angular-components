import { expect, Locator, Page, test } from '@playwright/test';
import { e2eEnableDarkTheme } from '../../e2e/utils';

test.describe('KbqContentPanelModule', () => {
    test.describe('E2eContentPanelState', () => {
        const getComponent = (page: Page): Locator => page.getByTestId('e2eContentPanelState');

        test('states', async ({ page }) => {
            await page.goto('/E2eContentPanelState');
            await expect(getComponent(page)).toHaveScreenshot('01-light.png');
            await e2eEnableDarkTheme(page);
            await expect(getComponent(page)).toHaveScreenshot('01-dark.png');
        });
    });
});
