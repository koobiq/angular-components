import { expect, Page, test } from '@playwright/test';
import { e2eEnableDarkTheme } from '../../e2e/utils';

test.describe('KbqTopBarModule', () => {
    test.describe('E2eTopBarStates', () => {
        const getComponent = (page: Page) => page.getByTestId('e2eTopBarStates');

        test('light theme', async ({ page }) => {
            await page.goto('/E2eTopBarStates');
            await expect(getComponent(page)).toHaveScreenshot();
        });

        test('dark theme', async ({ page }) => {
            await page.goto('/E2eTopBarStates');
            await e2eEnableDarkTheme(page);
            await expect(getComponent(page)).toHaveScreenshot();
        });
    });
});
