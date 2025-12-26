import { expect, Page, test } from '@playwright/test';
import { e2eEnableDarkTheme, e2eGoToRootPage } from '../../e2e/utils';

test.describe('KbqProgressSpinnerModule', () => {
    test.describe('E2eProgressSpinnerStates', () => {
        const getComponent = (page: Page) => page.getByTestId('e2eProgressSpinnerStates');

        test('light theme', async ({ page }) => {
            await e2eGoToRootPage(page);

            await page.waitForTimeout(50);

            await expect(getComponent(page)).toHaveScreenshot();
        });

        test('dark theme', async ({ page }) => {
            await e2eGoToRootPage(page);
            await e2eEnableDarkTheme(page);

            await page.waitForTimeout(50);

            await expect(getComponent(page)).toHaveScreenshot();
        });
    });
});
