import { expect, Locator, Page, test } from '@playwright/test';
import { e2eEnableDarkTheme, e2eHasOverflowShadow, e2eWaitForSettledScrollbars } from '../../e2e/utils';

test.describe('KbqContentPanelModule', () => {
    test.describe('E2eContentPanelState', () => {
        const getComponent = (page: Page): Locator => page.getByTestId('e2eContentPanelState');

        test('states', async ({ page }) => {
            await page.goto('/E2eContentPanelState');

            // The fixture scrolls the body on init, which reveals the scrollbar track.
            await e2eWaitForSettledScrollbars(page);

            await expect(getComponent(page)).toHaveScreenshot('01-light.png');
            await e2eEnableDarkTheme(page);
            await expect(getComponent(page)).toHaveScreenshot('01-dark.png');
        });
    });

    test.describe('overflow shadow', () => {
        test('should show footer shadow on init when body content overflows', async ({ page }) => {
            await page.goto('/E2eContentPanelScrollOverflow');

            await expect.poll(() => e2eHasOverflowShadow(page.locator('.kbq-content-panel-footer'))).toBeTruthy();
        });

        test('should show header shadow after scrolling down', async ({ page }) => {
            await page.goto('/E2eContentPanelScrollOverflow');

            await page.locator('.kbq-content-panel-body .kbq-scrollbar-viewport').evaluate((el) => {
                el.scrollTop = 50;
            });

            await expect.poll(() => e2eHasOverflowShadow(page.locator('.kbq-content-panel-header'))).toBeTruthy();
        });

        test('should show both shadows when scrolled to the middle', async ({ page }) => {
            await page.goto('/E2eContentPanelScrollOverflow');

            await page.locator('.kbq-content-panel-body .kbq-scrollbar-viewport').evaluate((el) => {
                el.scrollTop = Math.floor((el.scrollHeight - el.clientHeight) / 2);
            });

            await expect.poll(() => e2eHasOverflowShadow(page.locator('.kbq-content-panel-header'))).toBeTruthy();
            await expect.poll(() => e2eHasOverflowShadow(page.locator('.kbq-content-panel-footer'))).toBeTruthy();
        });
    });
});
