import { expect, Locator, Page, test } from '@playwright/test';
import { e2eEnableDarkTheme } from '../../e2e/utils';

test.describe('KbqBreadcrumbsModule', () => {
    test.describe('E2eBreadcrumbsStateAndStyle', () => {
        const getComponent = (page: Page) => page.getByTestId('e2eBreadcrumbsStateAndStyle');
        const getTestTable = (locator: Locator) => locator.getByTestId('e2eBreadcrumbsTable');
        const getTestRow = (locator: Locator) => locator.getByTestId('e2eBreadcrumbsDropdownRow');
        const hoverLastItem = (locator: Locator) => locator.locator('.kbq-breadcrumb-item').last().hover();

        test('KbqBreadcrumbs states', async ({ page }) => {
            await page.goto('/E2eBreadcrumbsStateAndStyle');
            const locator = getComponent(page);

            const screenshotTarget = getTestTable(locator);

            await expect(screenshotTarget).toHaveScreenshot();
        });

        test(`KbqBreadcrumbs states (dark theme)`, async ({ page }) => {
            await page.goto('/E2eBreadcrumbsStateAndStyle');
            await e2eEnableDarkTheme(page);

            const locator = getComponent(page);

            const screenshotTarget = getTestTable(locator);

            await expect(screenshotTarget).toHaveScreenshot();
        });

        test('KbqBreadcrumbs Dropdown Hover', async ({ page }) => {
            await page.goto('/E2eBreadcrumbsStateAndStyle');
            const locator = getComponent(page);

            const screenshotTarget = getTestRow(locator);

            await hoverLastItem(screenshotTarget);

            await expect(screenshotTarget).toHaveScreenshot();
        });
    });
});
