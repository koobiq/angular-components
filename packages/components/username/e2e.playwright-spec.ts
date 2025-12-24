import { expect, Locator, Page, test } from '@playwright/test';
import { e2eEnableDarkTheme, e2eGoToRootPage } from '../../e2e/utils';

test.describe('KbqUsername', () => {
    test.describe('E2eUsernameStateAndStyle', () => {
        const getComponent = (page: Page) => page.getByTestId('e2eUsernameStateAndStyle');
        const screenshotTarget = (locator: Locator) => locator.getByTestId('e2eUsernameTable');

        test('KbqUsername states', async ({ page }) => {
            await e2eGoToRootPage(page);
            const locator = getComponent(page);

            await expect(screenshotTarget(locator)).toHaveScreenshot();
        });

        test(`KbqUsername states (dark theme)`, async ({ page }) => {
            await e2eGoToRootPage(page);
            await e2eEnableDarkTheme(page);

            const locator = getComponent(page);

            await expect(screenshotTarget(locator)).toHaveScreenshot();
        });
    });
});
