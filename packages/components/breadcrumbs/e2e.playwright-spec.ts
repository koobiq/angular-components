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

    test('should show hidden items in the expand dropdown when max is exceeded', async ({ page }) => {
        await page.goto('/E2eBreadcrumbsOverflowMax');

        const breadcrumbs = page.getByTestId('e2eBreadcrumbsOverflowMax');

        await breadcrumbs.locator('.kbq-breadcrumb__expand').click();

        const dropdownPanel = page.locator('.kbq-dropdown__panel');

        await expect(dropdownPanel).toBeVisible();

        const dropdownItems = dropdownPanel.locator('[kbq-dropdown-item]');

        // max=4, items.length=5 → 2 middle items are hidden (Item #1, Item #2)
        await expect(dropdownItems).toHaveCount(2);
        await expect(dropdownItems.nth(0)).toHaveText('Item #1');
        await expect(dropdownItems.nth(1)).toHaveText('Item #2');
    });

    test('should hide dropdown panel when breadcrumb items fit into container', async ({ page }) => {
        await page.goto('/E2eBreadcrumbsOverflowMax');

        const dropdownPanel = () => page.locator('.kbq-dropdown__panel');

        const breadcrumbs = page.getByTestId('e2eBreadcrumbsOverflow');
        const breadcrumbsHost = page.getByTestId('e2eBreadcrumbsOverflowMaxHost');

        await breadcrumbs.locator('.kbq-breadcrumb__expand').click();

        await expect(dropdownPanel()).toBeVisible();

        const dropdownItems = dropdownPanel().locator('[kbq-dropdown-item]');

        await expect(dropdownItems).toHaveCount(2);

        await breadcrumbsHost.evaluate(({ style }) => (style.width = '1000px'));

        await expect(dropdownPanel()).not.toBeVisible();
    });
});

test.describe('KbqBreadcrumbsModule', () => {
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

test.describe('KbqBreadcrumbs inside a form', () => {
    // A `<button>` defaults to `type="submit"`, which makes it a candidate for the form's default
    // button — the one the browser activates on Enter in a field. Breadcrumbs navigate, so none of
    // them may be that button. jsdom does not implement implicit submission, so this only
    // reproduces in a real browser.
    test('should not activate a breadcrumb on Enter in a field', async ({ page }) => {
        await page.goto('/E2eBreadcrumbsInForm');

        const form = page.getByTestId('e2eBreadcrumbsForm');

        await expect(form.locator('.kbq-breadcrumb__expand')).toBeVisible();

        await page.getByTestId('e2eFirstField').press('Enter');

        await expect(page.locator('.kbq-dropdown__panel')).toBeHidden();
        await expect(page.getByTestId('e2eSubmitCount')).toHaveText('0');
        await expect(page).toHaveURL(/\/E2eBreadcrumbsInForm$/);
    });

    test('should render every breadcrumb button as type="button"', async ({ page }) => {
        await page.goto('/E2eBreadcrumbsInForm');

        const buttons = page.getByTestId('e2eBreadcrumbsForm').locator('button');

        await expect(buttons).not.toHaveCount(0);

        for (const button of await buttons.all()) {
            await expect(button).toHaveAttribute('type', 'button');
        }
    });
});
