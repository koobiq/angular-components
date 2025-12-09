import { expect, Locator, Page, test } from '@playwright/test';
import { devEnableDarkTheme, devGoToRootPage } from '../../e2e/utils';

test.describe('KbqDivider', () => {
    test.describe('E2eDividerStateAndStyle', () => {
        const getComponent = (page: Page) => page.getByTestId('e2eDividerStateAndStyle');
        const getTestTable = (locator: Locator) => locator.getByTestId('e2eDividerTable');

        test('KbqDivider states', async ({ page }) => {
            await devGoToRootPage(page);
            const locator = getComponent(page);

            const screenshotTarget = getTestTable(locator);

            await expect(screenshotTarget).toHaveScreenshot();
        });

        test(`KbqDivider states (dark theme)`, async ({ page }) => {
            await devGoToRootPage(page);
            await devEnableDarkTheme(page);

            const locator = getComponent(page);

            const screenshotTarget = getTestTable(locator);

            await expect(screenshotTarget).toHaveScreenshot();
        });
    });
});
