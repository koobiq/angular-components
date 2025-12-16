import { expect, Locator, Page, test } from '@playwright/test';
import { e2eEnableDarkTheme, e2eGoToRootPage } from '../../e2e/utils';

test.describe('KbqDivider', () => {
    test.describe('E2eDividerStateAndStyle', () => {
        const getComponent = (page: Page) => page.getByTestId('e2eDividerStateAndStyle');
        const getTestTable = (locator: Locator) => locator.getByTestId('e2eDividerTable');

        test('KbqDivider states', async ({ page }) => {
            await e2eGoToRootPage(page);
            const locator = getComponent(page);

            const screenshotTarget = getTestTable(locator);

            await expect(screenshotTarget).toHaveScreenshot();
        });

        test(`KbqDivider states (dark theme)`, async ({ page }) => {
            await e2eGoToRootPage(page);
            await e2eEnableDarkTheme(page);

            const locator = getComponent(page);

            const screenshotTarget = getTestTable(locator);

            await expect(screenshotTarget).toHaveScreenshot();
        });
    });
});
