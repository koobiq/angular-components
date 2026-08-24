import { expect, Locator, Page, test } from '@playwright/test';
import { e2eEnableDarkTheme } from '../../e2e/utils';

test.describe('KbqDlModule', () => {
    test.describe('E2eDlStates', () => {
        const getComponent = (page: Page) => page.getByTestId('e2eDlStates');

        test('states', async ({ page }) => {
            await page.goto('/E2eDlStates');
            await expect(getComponent(page)).toHaveScreenshot('01-light.png');
            await e2eEnableDarkTheme(page);
            await expect(getComponent(page)).toHaveScreenshot('01-dark.png');
        });
    });

    test.describe('E2eDlResizable', () => {
        const getComponent = (page: Page) => page.getByTestId('e2eDlResizableConfigured');
        const getAutoComponent = (page: Page) => page.getByTestId('e2eDlResizableAuto');
        const getList = (block: Locator) => block.locator('.kbq-dl');
        const getSeparator = (block: Locator) => block.getByRole('separator');
        const getFirstTerm = (block: Locator) => block.locator('.kbq-dt').first();

        const resizedClass = /(?:^|\s)kbq-dl_resized(?:\s|$)/;

        test('should reveal the separator line on hover and keyboard focus', async ({ page }) => {
            await page.goto('/E2eDlResizable');

            const block = getComponent(page);
            const list = getList(block);
            const separator = getSeparator(block);
            const getLineOpacity = () => separator.evaluate((element) => getComputedStyle(element, '::after').opacity);

            expect(await getLineOpacity()).toBe('0');

            await list.hover({ position: { x: 1, y: 1 } });
            expect(await getLineOpacity()).toBe('1');

            await page.mouse.move(0, 0);
            expect(await getLineOpacity()).toBe('0');

            await page.keyboard.press('Tab');
            await expect(separator).toBeFocused();
            expect(await getLineOpacity()).toBe('1');
        });

        test('should widen the first column when the separator is dragged to the right', async ({ page }) => {
            await page.goto('/E2eDlResizable');

            const block = getComponent(page);
            const separator = getSeparator(block);
            const term = getFirstTerm(block);

            const startWidth = (await term.boundingBox())!.width;

            await separator.hover();
            const box = (await separator.boundingBox())!;
            const startX = box.x + box.width / 2;
            const startY = box.y + box.height / 2;
            const dragOffset = 60;

            await page.mouse.down();
            expect(await separator.evaluate((element) => getComputedStyle(element, '::after').width)).toBe('3px');
            await page.mouse.move(startX + dragOffset, startY, { steps: 5 });
            await page.mouse.up();

            const endWidth = (await term.boundingBox())!.width;

            expect(endWidth).toBeGreaterThan(startWidth);
            expect(endWidth).toBeCloseTo(startWidth + dragOffset, 0);
            await expect(getList(block)).toHaveClass(resizedClass);
        });

        test('should collapse to the minimum on double click and reset on the second', async ({ page }) => {
            await page.goto('/E2eDlResizable');

            const block = getComponent(page);
            const separator = getSeparator(block);

            await separator.dblclick();
            await expect(getList(block)).toHaveClass(resizedClass);
            await expect(separator).toHaveAttribute('aria-valuenow', '120');

            await separator.dblclick();
            await expect(getList(block)).not.toHaveClass(resizedClass);
        });

        test('should resize the first column with the keyboard', async ({ page }) => {
            await page.goto('/E2eDlResizable');

            const block = getComponent(page);
            const separator = getSeparator(block);
            const term = getFirstTerm(block);

            const startWidth = (await term.boundingBox())!.width;

            await separator.focus();
            await page.keyboard.press('ArrowRight');

            await expect(getList(block)).toHaveClass(resizedClass);
            expect((await term.boundingBox())!.width).toBeGreaterThanOrEqual(startWidth);
        });

        test('should default the dt and dd minimums to the measured term width when they are not set', async ({
            page
        }) => {
            await page.goto('/E2eDlResizable');

            const block = getAutoComponent(page);
            const separator = getSeparator(block);
            const termWidth = Math.round((await getFirstTerm(block).boundingBox())!.width);

            // With no `dtMinWidth`/`ddMinWidth`, the resizer falls back to the measured term width.
            const ariaValueMin = Number(await separator.getAttribute('aria-valuemin'));

            expect(ariaValueMin).toBeGreaterThan(0);
            expect(ariaValueMin).toBeCloseTo(termWidth, 0);
        });
    });
});
