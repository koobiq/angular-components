import { expect, Locator, Page, test } from '@playwright/test';
import { e2eEnableDarkTheme } from 'packages/e2e/utils';

test.describe('KbqBreadcrumbs overflow', () => {
    test('should enforce the max limit of breadcrumb items displayed', async ({ page }) => {
        await page.goto('/E2eBreadcrumbsOverflowMax');

        const breadcrumbs = page.getByTestId('e2eBreadcrumbsOverflowMax');
        const allItems = breadcrumbs.locator('.kbq-overflow-item');
        const visibleItems = breadcrumbs.locator('.kbq-overflow-item:not(.kbq-overflow-item-hidden)');

        // max = 4, items.length = 5 — total breadcrumb items rendered should equal items.length,
        // and visible (non-hidden) items should equal max - 1.
        await expect(allItems).toHaveCount(5);
        await expect(visibleItems).toHaveCount(3);
    });
});

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
