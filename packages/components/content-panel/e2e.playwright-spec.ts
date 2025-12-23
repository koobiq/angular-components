import { expect, Locator, Page, test } from '@playwright/test';
import { e2eEnableDarkTheme, e2eGoToRootPage } from '../../e2e/utils';

test.describe('KbqContentPanelModule', () => {
    test.describe('E2eContentPanelState', () => {
        const getComponent = (page: Page): Locator => page.getByTestId('e2eContentPanelState');

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
});
