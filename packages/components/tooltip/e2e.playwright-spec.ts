import { expect, Locator, Page, test } from '@playwright/test';
import { e2eEnableDarkTheme } from '../../e2e/utils';

test.describe('KbqTooltipModule', () => {
    test.describe('E2eTooltipStates', () => {
        const getComponent = (page: Page) => page.getByTestId('e2eTooltipStates');
        const getScreenshotTarget = (locator: Locator) => locator.getByTestId('e2eScreenshotTarget');

        test('states', async ({ page }) => {
            await page.goto('/E2eTooltipStates');
            const locator = getComponent(page);

            await expect(getScreenshotTarget(locator)).toHaveScreenshot('01-light.png');
            await e2eEnableDarkTheme(page);
            await expect(getScreenshotTarget(locator)).toHaveScreenshot('01-dark.png');
        });
    });

    test.describe('E2eTooltipArrowOffset', () => {
        test('should change offset for arrowless tooltip', async ({ page }) => {
            await page.goto('/E2eTooltipArrowOffset');

            await page.getByTestId('tooltipWithArrow').hover();
            const tooltipWithArrow = page.locator('.kbq-tooltip:not(.kbq-tooltip_arrowless)');

            await expect(tooltipWithArrow).toBeVisible();
            await expect(tooltipWithArrow).toHaveCSS('margin-top', '8px');

            await page.mouse.move(0, 0);
            await expect(tooltipWithArrow).toBeHidden();

            await page.getByTestId('tooltipWithoutArrow').hover();
            const tooltipWithoutArrow = page.locator('.kbq-tooltip.kbq-tooltip_arrowless');

            await expect(tooltipWithoutArrow).toBeVisible();
            await expect(tooltipWithoutArrow).toHaveCSS('margin-top', '4px');
        });

        test('should dismiss a hover-opened tooltip with Escape', async ({ page }) => {
            await page.goto('/E2eTooltipArrowOffset');

            await page.getByTestId('tooltipWithArrow').hover();

            const tooltip = page.locator('.kbq-tooltip');

            await expect(tooltip).toBeVisible();

            // The pointer never leaves the trigger and the trigger is not focusable, so the only thing that
            // can route the key to the tooltip is the overlay-level handler.
            await page.keyboard.press('Escape');

            await expect(tooltip).toBeHidden();
        });

        test('should let the pointer reach the tooltip', async ({ page }) => {
            await page.goto('/E2eTooltipArrowOffset');

            await page.getByTestId('tooltipWithArrow').hover();

            await expect(page.locator('.kbq-tooltip-panel')).toHaveCSS('pointer-events', 'auto');
        });
    });
});
