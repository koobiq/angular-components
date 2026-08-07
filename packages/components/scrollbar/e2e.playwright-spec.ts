import { expect, Page, test } from '@playwright/test';
import { e2eEnableDarkTheme } from 'packages/e2e/utils';

test.describe('KbqScrollbar', () => {
    test.describe('E2eScrollbarStateAndStyle', () => {
        const getComponent = (page: Page) => page.getByTestId('e2eScrollbarStateAndStyle');

        test('states', async ({ page }) => {
            await page.goto('/E2eScrollbarStateAndStyle');
            const component = getComponent(page);

            await expect(component).toHaveScreenshot('01-light.png');
            await e2eEnableDarkTheme(page);
            await expect(component).toHaveScreenshot('01-dark.png');
        });
    });
});
