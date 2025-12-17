import { expect, Locator, Page, test } from '@playwright/test';
import { e2eEnableDarkTheme, e2eGoToRootPage } from '../../e2e/utils';

test.describe('KbqCheckboxModule', () => {
    test.describe('E2eCheckboxStateAndStyle', () => {
        const getComponent = (page: Page): Locator => page.getByTestId('e2eCheckboxStateAndStyle');

        test('light theme', async ({ page }) => {
            await e2eGoToRootPage(page);
            await expect(getComponent(page)).toHaveScreenshot();
        });

        test('dark theme', async ({ page }) => {
            await e2eGoToRootPage(page);
            await e2eEnableDarkTheme(page);
            await expect(getComponent(page)).toHaveScreenshot();
        });
    });

    test.describe('E2eCheckboxWithTextAndCaption', () => {
        const getComponent = (page: Page): Locator => page.getByTestId('e2eCheckboxWithTextAndCaption');

        test('default', async ({ page }) => {
            await e2eGoToRootPage(page);
            await expect(getComponent(page)).toHaveScreenshot();
        });
    });
});
