import { expect, Locator, Page, test } from '@playwright/test';
import { e2eEnableDarkTheme } from '../../e2e/utils';

test.describe('KbqCheckboxModule', () => {
    test.describe('E2eCheckboxStateAndStyle', () => {
        const getComponent = (page: Page): Locator => page.getByTestId('e2eCheckboxStateAndStyle');

        test('states', async ({ page }) => {
            await page.goto('/E2eCheckboxStateAndStyle');
            await expect(getComponent(page)).toHaveScreenshot('01-light.png');
            await e2eEnableDarkTheme(page);
            await expect(getComponent(page)).toHaveScreenshot('01-dark.png');
        });
    });

    test.describe('E2eCheckboxWithTextAndCaption', () => {
        const getComponent = (page: Page): Locator => page.getByTestId('e2eCheckboxWithTextAndCaption');

        test('states', async ({ page }) => {
            await page.goto('/E2eCheckboxWithTextAndCaption');
            await expect(getComponent(page)).toHaveScreenshot('02-light.png');
            await e2eEnableDarkTheme(page);
            await expect(getComponent(page)).toHaveScreenshot('02-dark.png');
        });

        test('cursor is pointer only on the clickable label, not the host dead zone', async ({ page }) => {
            await page.goto('/E2eCheckboxWithTextAndCaption');

            const checkbox = getComponent(page).locator('kbq-checkbox').first();
            const label = checkbox.locator('.kbq-checkbox__layout');

            const hostCursor = await checkbox.evaluate((el) => window.getComputedStyle(el).cursor);
            const labelCursor = await label.evaluate((el) => window.getComputedStyle(el).cursor);

            expect(hostCursor).not.toBe('pointer');
            expect(labelCursor).toBe('pointer');
        });

        test('cursor is default on disabled checkbox host and label', async ({ page }) => {
            await page.goto('/E2eCheckboxWithTextAndCaption');

            const disabledCheckbox = getComponent(page).locator('kbq-checkbox.kbq-disabled').first();
            const label = disabledCheckbox.locator('.kbq-checkbox__layout');

            await expect(disabledCheckbox).toBeVisible();
            await expect(label).toBeVisible();

            await expect(disabledCheckbox).toHaveCSS('cursor', 'default');
            await expect(label).toHaveCSS('cursor', 'default');
        });
    });
});
