import { expect, Locator, Page, test } from '@playwright/test';
import { e2eEnableDarkTheme } from '../../e2e/utils';

test.describe('KbqDl', () => {
    test.describe('E2eDlStates', () => {
        test('should draw the horizontal, wide, fixed-width and vertical layouts', async ({ page }) => {
            await page.goto('/E2eDlStates');

            const target = page.getByTestId('e2eDlStates').getByTestId('e2eScreenshotTarget');

            await expect(target).toHaveScreenshot('01-light.png');
            await e2eEnableDarkTheme(page);
            await expect(target).toHaveScreenshot('01-dark.png');
        });
    });

    test.describe('E2eDlResizerStates', () => {
        test('should draw the separator at rest, under the hovered list, hovered, focused and dragged', async ({
            page
        }) => {
            await page.goto('/E2eDlResizerStates');

            const target = page.getByTestId('e2eDlResizerStates').getByTestId('e2eScreenshotTarget');

            // The states are forced once the first render is done; shoot only after the last of them is in place.
            await expect(target.locator('.kbq-dl__resize-handle.kbq-active')).toHaveCount(1);

            await expect(target).toHaveScreenshot('02-light.png');
            await e2eEnableDarkTheme(page);
            await expect(target).toHaveScreenshot('02-dark.png');
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

            await expect(separator).toHaveCSS('opacity', '0', { pseudo: 'after' });

            await list.hover({ position: { x: 1, y: 1 } });
            await expect(separator).toHaveCSS('opacity', '1', { pseudo: 'after' });

            await page.mouse.move(0, 0);
            await expect(separator).toHaveCSS('opacity', '0', { pseudo: 'after' });

            await page.keyboard.press('Tab');
            await expect(separator).toBeFocused();
            await expect(separator).toHaveCSS('opacity', '1', { pseudo: 'after' });
        });

        test('should remove the keyboard focus outline when pointer dragging starts', async ({ page }) => {
            await page.goto('/E2eDlResizable');

            const separator = getSeparator(getComponent(page));
            const getDocumentCursor = () => page.locator('body').evaluate((element) => element.style.cursor);

            await page.keyboard.press('Tab');
            await expect(separator).toBeFocused();
            await expect(separator).toHaveCSS('outline-style', 'solid');

            await separator.hover();
            await page.mouse.down();
            await expect(separator).toHaveCSS('outline-style', 'none');
            await expect.poll(getDocumentCursor).toBe('col-resize');

            await page.mouse.up();
            // The drag hands the body cursor back on pointerup. Read the outline once after that: a retrying
            // matcher would pass on the `none` left from the drag before the pointerup is handled.
            await expect.poll(getDocumentCursor).toBe('');
            const outlineAfterDrag = await separator.evaluate((element) => getComputedStyle(element).outlineStyle);

            expect(outlineAfterDrag).toBe('none');
        });

        test('should keep the resize cursor outside the handle and restore it after drag', async ({ page }) => {
            await page.goto('/E2eDlResizable');

            const separator = getSeparator(getComponent(page));
            const getDocumentCursor = () => page.locator('body').evaluate((element) => element.style.cursor);

            await separator.hover();
            const box = (await separator.boundingBox())!;
            const startX = box.x + box.width / 2;
            const startY = box.y + box.height / 2;

            await page.mouse.down();
            await expect.poll(getDocumentCursor).toBe('col-resize');

            // Move well past the handle after the dt column stops at its minimum.
            await page.mouse.move(1, startY);
            await expect(separator).toHaveAttribute('aria-valuenow', '120');
            await expect.poll(getDocumentCursor).toBe('e-resize');

            await page.mouse.move(20, startY);
            await expect(separator).toHaveAttribute('aria-valuenow', '120');
            await expect.poll(getDocumentCursor).toBe('e-resize');

            // The same gesture can return to the available range.
            await page.mouse.move(startX + 50, startY);
            await expect.poll(async () => Number(await separator.getAttribute('aria-valuenow'))).toBeGreaterThan(120);
            await expect.poll(getDocumentCursor).toBe('col-resize');

            await page.mouse.up();
            await expect.poll(getDocumentCursor).toBe('');
        });

        test('should widen the first column when the separator is dragged to the right', async ({ page }) => {
            await page.goto('/E2eDlResizable');

            const block = getComponent(page);
            const separator = getSeparator(block);
            const term = getFirstTerm(block);
            const getTermWidth = async () => (await term.boundingBox())!.width;

            const startWidth = await getTermWidth();

            await separator.hover();
            const box = (await separator.boundingBox())!;
            const startX = box.x + box.width / 2;
            const startY = box.y + box.height / 2;
            const dragOffset = 60;

            await page.mouse.down();
            await expect(separator).toHaveCSS('width', '3px', { pseudo: 'after' });
            await page.mouse.move(startX + dragOffset, startY, { steps: 5 });
            await page.mouse.up();

            // The column follows the last move a render later.
            await expect.poll(getTermWidth).toBeGreaterThan(startWidth);
            await expect.poll(getTermWidth).toBeCloseTo(startWidth + dragOffset, 0);
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

            // With no `dtMinWidth`/`ddMinWidth`, the resizer falls back to the measured term width, which is taken
            // after the first render and bound a render later.
            const getAriaValueMin = async () => Number(await separator.getAttribute('aria-valuemin'));

            await expect.poll(getAriaValueMin).toBeGreaterThan(0);
            await expect.poll(getAriaValueMin).toBeCloseTo(termWidth, 0);
        });
    });
});
