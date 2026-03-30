import { expect, Page, test } from '@playwright/test';
import { e2eEnableDarkTheme } from '../../e2e/utils';

test.describe('KbqMarkdownModule', () => {
    test.describe('E2eMarkdownStates', () => {
        const getComponent = (page: Page) => page.getByTestId('e2eMarkdownStates');

        test('states', async ({ page }) => {
            await page.goto('/E2eMarkdownStates');
            await expect(getComponent(page)).toHaveScreenshot('01-light.png');
            await e2eEnableDarkTheme(page);
            await expect(getComponent(page)).toHaveScreenshot('01-dark.png');
        });
    });
});
