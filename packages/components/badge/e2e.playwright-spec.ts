import { expect, Page, test } from '@playwright/test';
import { devEnableDarkTheme, devGoToRootPage } from '../../e2e/utils';

test.describe('KbqBadgeModule', () => {
    test.describe('E2eBadgeStyles', () => {
        const getComponent = (page: Page) => page.getByTestId('e2eBadgeStyles');

        test('light theme', async ({ page }) => {
            await devGoToRootPage(page);
            await expect(getComponent(page)).toHaveScreenshot();
        });

        test('dark theme', async ({ page }) => {
            await devGoToRootPage(page);
            await devEnableDarkTheme(page);
            await expect(getComponent(page)).toHaveScreenshot();
        });
    });
});
