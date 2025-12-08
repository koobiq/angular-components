import { expect, Locator, Page, test } from '@playwright/test';
import { devEnableDarkTheme, devGoToRootPage } from '../../e2e/utils';

test.describe('KbqBreadcrumbsModule', () => {
    test.describe('E2eBreadcrumbsStateAndStyle', () => {
        const getComponent = (page: Page) => page.getByTestId('e2eBreadcrumbsStateAndStyle');
        const getTestTable = (locator: Locator) => locator.getByTestId('e2eBreadcrumbsTable');
        const getTestRow = (locator: Locator) => locator.getByTestId('e2eBreadcrumbsDropdownRow');
        const focusLastItem = (locator: Locator) => locator.locator('.kbq-breadcrumb-item')?.last()?.focus();

        test('KbqBreadcrumbs states', async ({ page }) => {
            await devGoToRootPage(page);
            const locator = getComponent(page);

            const screenshotTarget = getTestTable(locator);

            await expect(screenshotTarget).toHaveScreenshot();
        });

        test(`KbqBreadcrumbs states (dark theme)`, async ({ page }) => {
            await devGoToRootPage(page);
            await devEnableDarkTheme(page);

            const locator = getComponent(page);

            const screenshotTarget = getTestTable(locator);

            await expect(screenshotTarget).toHaveScreenshot();
        });

        test('KbqBreadcrumbs Dropdown Hover', async ({ page }) => {
            await devGoToRootPage(page);
            const locator = getComponent(page);

            const screenshotTarget = getTestRow(locator);

            await focusLastItem(screenshotTarget);

            await expect(screenshotTarget).toHaveScreenshot();
        });
    });
});
