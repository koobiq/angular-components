import { expect, Locator, Page, test } from '@playwright/test';
import { e2eEnableDarkTheme } from '../../e2e/utils';

test.describe('KbqPopoverModule', () => {
    test.describe('E2ePopoverStates', () => {
        const getComponent = (page: Page) => page.getByTestId('e2ePopoverStates');
        const getScreenshotTarget = (locator: Locator) => locator.getByTestId('e2eScreenshotTarget');

        test('states', async ({ page }) => {
            await page.goto('/E2ePopoverStates');
            const locator = getComponent(page);

            await expect(getScreenshotTarget(locator)).toHaveScreenshot('01-light.png');
            await e2eEnableDarkTheme(page);
            await expect(getScreenshotTarget(locator)).toHaveScreenshot('01-dark.png');
        });
    });

    test.describe('overflow shadow', () => {
        test('should show footer shadow on init when content overflows', async ({ page }) => {
            await page.goto('/E2ePopoverStates');
            const mediumPopover = page.locator('.kbq-popover_medium').first();

            await expect(mediumPopover).toBeVisible();

            await expect(mediumPopover.locator('.kbq-popover__footer')).toHaveClass(
                /kbq-popover__footer_bottom-overflow/
            );
        });

        test('should show header shadow after scrolling down', async ({ page }) => {
            await page.goto('/E2ePopoverStates');
            const mediumPopover = page.locator('.kbq-popover_medium').first();

            await expect(mediumPopover).toBeVisible();

            await mediumPopover.locator('.kbq-popover__content').evaluate((el) => {
                el.scrollTop = 50;
            });

            await expect(mediumPopover.locator('.kbq-popover__header')).toHaveClass(/kbq-popover__header_top-overflow/);
        });

        test('should show both shadows when scrolled to the middle', async ({ page }) => {
            await page.goto('/E2ePopoverStates');
            const mediumPopover = page.locator('.kbq-popover_medium').first();

            await expect(mediumPopover).toBeVisible();

            await mediumPopover.locator('.kbq-popover__content').evaluate((el) => {
                el.scrollTop = Math.floor((el.scrollHeight - el.clientHeight) / 2);
            });

            await expect(mediumPopover.locator('.kbq-popover__header')).toHaveClass(/kbq-popover__header_top-overflow/);
            await expect(mediumPopover.locator('.kbq-popover__footer')).toHaveClass(
                /kbq-popover__footer_bottom-overflow/
            );
        });
    });
});
