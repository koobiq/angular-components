import { expect, Page, test } from '@playwright/test';
import { e2eEnableDarkTheme } from '../../e2e/utils';

test.describe('KbqInlineEdit', () => {
    test.describe('E2eInlineEditStates', () => {
        const getComponent = (page: Page) => page.getByTestId('e2eInlineEditStates');

        test('states', async ({ page }) => {
            await page.goto('/E2eInlineEditStates');
            const screenshotTarget = getComponent(page);

            await expect(screenshotTarget).toHaveScreenshot('01-light.png');
            await e2eEnableDarkTheme(page);
            await expect(screenshotTarget).toHaveScreenshot('01-dark.png');
        });
    });
});
