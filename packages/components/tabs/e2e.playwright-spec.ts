import { expect, Page, test } from '@playwright/test';
import { e2eEnableDarkTheme, e2eWhenStable } from 'packages/e2e/utils';

test.describe('KbqTabsModule', () => {
    test.describe('E2eTabsStates', () => {
        const getComponent = (page: Page) => page.getByTestId('e2eTabsStates');

        test('states', async ({ page }) => {
            await page.goto('/E2eTabsStates');

            const component = getComponent(page);

            await e2eWhenStable(component);

            await expect(component).toHaveScreenshot('01-light.png');
            await e2eEnableDarkTheme(page);
            await expect(component).toHaveScreenshot('01-dark.png');
        });
    });
});
