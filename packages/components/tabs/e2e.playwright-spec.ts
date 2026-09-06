import { expect, Page, test } from '@playwright/test';
import { e2eEnableDarkTheme } from 'packages/e2e/utils';

test.describe('KbqTabsModule', () => {
    test.describe('E2eTabsStates', () => {
        const getComponent = (page: Page) => page.getByTestId('e2eTabsStates');

        test('states', async ({ page }) => {
            await page.goto('/E2eTabsStates');

            const component = getComponent(page);

            await expect(component).toHaveScreenshot('01-light.png');
            await e2eEnableDarkTheme(page);
            await expect(component).toHaveScreenshot('01-dark.png');
        });

        test('should follow the vertical binding rather than the attribute', async ({ page }) => {
            await page.goto('/E2eTabsStates');

            await expect(page.getByTestId('e2eTabsVerticalBoundFalse')).not.toHaveClass(/kbq-tab-group_vertical/);
        });
    });

    test.describe('E2eTabNavBar', () => {
        test('should make disabled links unclickable', async ({ page }) => {
            await page.goto('/E2eTabNavBar');

            const enabledLink = page.getByTestId('tabNavBar_default').locator('a');
            const disabledLink = page.getByTestId('tabNavBar_disabled').locator('a');

            await expect(enabledLink).not.toHaveCSS('pointer-events', 'none');
            await expect(disabledLink).toHaveCSS('pointer-events', 'none');
        });
    });
});
