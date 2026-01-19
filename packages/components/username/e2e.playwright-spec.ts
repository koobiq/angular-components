import { expect, Locator, Page, test } from '@playwright/test';
import { e2eEnableDarkTheme } from '../../e2e/utils';

test.describe('KbqUsername', () => {
    test.describe('E2eUsernameStateAndStyle', () => {
        const getComponent = (page: Page) => page.getByTestId('e2eUsernameStateAndStyle');
        const screenshotTarget = (locator: Locator) => locator.getByTestId('e2eUsernameTable');

        test('states', async ({ page }) => {
            await page.goto('/E2eUsernameStateAndStyle');
            const locator = getComponent(page);

            await expect(screenshotTarget(locator)).toHaveScreenshot('01-light.png');
            await e2eEnableDarkTheme(page);
            await expect(screenshotTarget(locator)).toHaveScreenshot('01-dark.png');
        });
    });
});
