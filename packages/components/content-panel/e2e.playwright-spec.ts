import { expect, Locator, Page, test } from '@playwright/test';
import { e2eEnableDarkTheme } from '../../e2e/utils';

test.describe('KbqContentPanelModule', () => {
    test.describe('E2eContentPanelState', () => {
        const getComponent = (page: Page): Locator => page.getByTestId('e2eContentPanelState');

        test('states', async ({ page }) => {
            await page.goto('/E2eContentPanelState');
            await expect(getComponent(page)).toHaveScreenshot('01-light.png');
            await e2eEnableDarkTheme(page);
            await expect(getComponent(page)).toHaveScreenshot('01-dark.png');
        });
    });

    test.describe('overflow shadow', () => {
        test('should show footer shadow on init when body content overflows', async ({ page }) => {
            await page.goto('/E2eContentPanelScrollOverflow');
            await page.waitForTimeout(100);

            await expect(page.locator('.kbq-content-panel')).toHaveClass(/kbq-content-panel_footer-with-shadow/);
        });

        test('should show header shadow after scrolling down', async ({ page }) => {
            await page.goto('/E2eContentPanelScrollOverflow');
            await page.waitForTimeout(100);

            await page.locator('.kbq-content-panel-body [data-overlayscrollbars-contents]').evaluate((el) => {
                el.scrollTop = 50;
            });

            await expect(page.locator('.kbq-content-panel')).toHaveClass(/kbq-content-panel_header-with-shadow/);
        });

        test('should show both shadows when scrolled to the middle', async ({ page }) => {
            await page.goto('/E2eContentPanelScrollOverflow');
            await page.waitForTimeout(100);

            await page.locator('.kbq-content-panel-body [data-overlayscrollbars-contents]').evaluate((el) => {
                el.scrollTop = Math.floor((el.scrollHeight - el.clientHeight) / 2);
            });

            await expect(page.locator('.kbq-content-panel')).toHaveClass(/kbq-content-panel_header-with-shadow/);
            await expect(page.locator('.kbq-content-panel')).toHaveClass(/kbq-content-panel_footer-with-shadow/);
        });
    });
});
