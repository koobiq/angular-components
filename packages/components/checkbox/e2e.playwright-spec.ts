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
    });
});
