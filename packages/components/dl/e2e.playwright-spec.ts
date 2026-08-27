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

    test.describe('E2eDlLongText', () => {
        const getHeight = async (locator: Locator) => (await locator.boundingBox())!.height;

        test('should wrap long unbroken text without horizontal overflow', async ({ page }) => {
            await page.goto('/E2eDlLongText');

            const component = page.getByTestId('e2eDlLongText');
            const list = component.locator('.kbq-dl');
            const shortTerm = page.getByTestId('e2eDlShortTerm');
            const shortDescription = page.getByTestId('e2eDlShortDescription');
            const longTerm = page.getByTestId('e2eDlLongTerm');
            const longDescription = page.getByTestId('e2eDlLongDescription');

            expect(await getHeight(longTerm)).toBeGreaterThanOrEqual((await getHeight(shortTerm)) * 2);
            expect(await getHeight(longDescription)).toBeGreaterThanOrEqual((await getHeight(shortDescription)) * 2);
            expect(await list.evaluate((element) => element.scrollWidth <= element.clientWidth)).toBe(true);
            expect(await longTerm.evaluate((element) => element.scrollWidth <= element.clientWidth)).toBe(true);
            expect(await longDescription.evaluate((element) => element.scrollWidth <= element.clientWidth)).toBe(true);
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

        test('should remove the keyboard focus outline when pointer dragging starts', async ({ page }) => {
            await page.goto('/E2eDlResizable');

            const separator = getSeparator(getComponent(page));
            const getOutlineStyle = () => separator.evaluate((element) => getComputedStyle(element).outlineStyle);

            await page.keyboard.press('Tab');
            await expect(separator).toBeFocused();
            expect(await getOutlineStyle()).toBe('solid');

            await separator.hover();
            await page.mouse.down();
            expect(await getOutlineStyle()).toBe('none');

            await page.mouse.up();
            expect(await getOutlineStyle()).toBe('none');
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
