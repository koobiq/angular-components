import { expect, Locator, Page, test } from '@playwright/test';
import { devEnableDarkTheme, devGoToRootPage } from '../../e2e/utils';

test.describe('KbqEmptyStateModule', () => {
    test.describe('E2eEmptyStateStateAndStyle', () => {
        const getComponent = (page: Page) => page.getByTestId('e2eEmptyStateStateAndStyle');
        const getTestTable = (locator: Locator) => locator.getByTestId('e2eEmptyStateTable');

        test('KbqEmptyState states', async ({ page }) => {
            await devGoToRootPage(page);
            const locator = getComponent(page);

            const screenshotTarget = getTestTable(locator);

            await expect(screenshotTarget).toHaveScreenshot();
        });

        test(`KbqEmptyState states (dark theme)`, async ({ page }) => {
            await devGoToRootPage(page);
            await devEnableDarkTheme(page);

            const locator = getComponent(page);

            const screenshotTarget = getTestTable(locator);

            await expect(screenshotTarget).toHaveScreenshot();
        });
    });
});
