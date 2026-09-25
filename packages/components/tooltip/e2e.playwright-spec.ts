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

    test.describe('E2eTooltipRelativeToCaret', () => {
        const getComponent = (page: Page) => page.getByTestId('e2eTooltipRelativeToCaret');
        const getScreenshotTarget = (locator: Locator) => locator.getByTestId('e2eScreenshotTarget');
        const getTooltip = (page: Page) => page.locator('.kbq-tooltip');

        /** Horizontal centre of the open tooltip, which is what the caret is supposed to drag around. */
        const getTooltipCentre = async (page: Page): Promise<number> => {
            const box = await getTooltip(page).boundingBox();

            return box!.x + box!.width / 2;
        };

        test('should follow the caret across the input', async ({ page }) => {
            await page.goto('/E2eTooltipRelativeToCaret');

            const field = page.getByTestId('e2eTooltipCaretInput');

            await field.pressSequentially('abcde');
            await expect(getTooltip(page)).toBeVisible();

            const nearStart = await getTooltipCentre(page);

            await field.pressSequentially('fghijklmnopqrstuvwxyz');

            // Settled on the new caret before it is measured: the reposition is driven by the `input` event.
            await expect.poll(async () => (await getTooltipCentre(page)) > nearStart + 50).toBe(true);
        });

        test('should keep the tooltip above a single-line input by default', async ({ page }) => {
            await page.goto('/E2eTooltipRelativeToCaret');

            const field = page.getByTestId('e2eTooltipCaretInput');

            await field.pressSequentially('abcde');
            await expect(getTooltip(page)).toBeVisible();

            const tooltip = (await getTooltip(page).boundingBox())!;
            const input = (await field.boundingBox())!;

            expect(tooltip.y + tooltip.height).toBeLessThanOrEqual(input.y);
        });

        test('should follow the caret down the wrapped lines of a textarea', async ({ page }) => {
            await page.goto('/E2eTooltipRelativeToCaret');

            const field = page.getByTestId('e2eTooltipCaretTextarea');

            await field.pressSequentially('first');
            await expect(getTooltip(page)).toBeVisible();

            const firstLine = (await getTooltip(page).boundingBox())!.y;

            await field.press('Enter');
            await field.pressSequentially('second');

            await expect.poll(async () => (await getTooltip(page).boundingBox())!.y > firstLine).toBe(true);
        });

        test('states', async ({ page }) => {
            await page.goto('/E2eTooltipRelativeToCaret');

            const locator = getComponent(page);

            await page.getByTestId('e2eTooltipCaretInput').pressSequentially('anchored to the caret');
            await expect(getTooltip(page)).toBeVisible();

            await expect(getScreenshotTarget(locator)).toHaveScreenshot('02-light.png');
            await e2eEnableDarkTheme(page);
            await expect(getScreenshotTarget(locator)).toHaveScreenshot('02-dark.png');
        });
    });
});
