import { expect, Locator, Page, test } from '@playwright/test';
import { e2eEnableDarkTheme } from 'packages/e2e/utils';

// @TODO: should be fixed (#DS-4622)
test.fixme('KbqBreadcrumbsModule', () => {
    test.describe('E2eBreadcrumbsStateAndStyle', () => {
        const getComponent = (page: Page) => page.getByTestId('e2eBreadcrumbsStateAndStyle');
        const getBreadcrumbsWithDropdown = (locator: Locator) => locator.getByTestId('e2eBreadcrumbsWithDropdown');
        const getLastBreadcrumbItem = (locator: Locator) => locator.locator('.kbq-breadcrumb-item').last();

        test('states', async ({ page }) => {
            await page.goto('/E2eBreadcrumbsStateAndStyle');

            const component = getComponent(page);

            await expect(component).toHaveScreenshot('01-light.png');
            await e2eEnableDarkTheme(page);
            await expect(component).toHaveScreenshot('01-dark.png');
        });

        test('dropdown and hover', async ({ page }) => {
            await page.goto('/E2eBreadcrumbsStateAndStyle');

            const component = getComponent(page);

            const screenshotTarget = getBreadcrumbsWithDropdown(component);

            await getLastBreadcrumbItem(screenshotTarget).hover();

            await expect(screenshotTarget).toHaveScreenshot('02-light.png');
        });
    });
});
