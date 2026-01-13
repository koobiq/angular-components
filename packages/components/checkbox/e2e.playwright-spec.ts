import { expect, Locator, Page, test } from '@playwright/test';
import { e2eEnableDarkTheme } from '../../e2e/utils';

test.describe('KbqCheckboxModule', () => {
    test.describe('E2eCheckboxStateAndStyle', () => {
        const getComponent = (page: Page): Locator => page.getByTestId('e2eCheckboxStateAndStyle');

        test('light theme', async ({ page }) => {
            await page.goto('/E2eCheckboxStateAndStyle');
            await expect(getComponent(page)).toHaveScreenshot();
        });

        test('dark theme', async ({ page }) => {
            await page.goto('/E2eCheckboxStateAndStyle');
            await e2eEnableDarkTheme(page);
            await expect(getComponent(page)).toHaveScreenshot();
        });
    });

    test.describe('E2eCheckboxWithTextAndCaption', () => {
        const getComponent = (page: Page): Locator => page.getByTestId('e2eCheckboxWithTextAndCaption');

        test('light theme', async ({ page }) => {
            await page.goto('/E2eCheckboxWithTextAndCaption');
            await expect(getComponent(page)).toHaveScreenshot();
        });

        test('dark theme', async ({ page }) => {
            await page.goto('/E2eCheckboxWithTextAndCaption');
            await e2eEnableDarkTheme(page);
            await expect(getComponent(page)).toHaveScreenshot();
        });
    });
});
