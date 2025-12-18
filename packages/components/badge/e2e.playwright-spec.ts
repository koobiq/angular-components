import { expect, Page, test } from '@playwright/test';
import { e2eEnableDarkTheme, e2eGoToRootPage } from 'packages/e2e/utils';

test.describe('KbqBadgeModule', () => {
    test.describe('E2eBadgeStyles', () => {
        const getComponent = (page: Page) => page.getByTestId('e2eBadgeStyles');

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
