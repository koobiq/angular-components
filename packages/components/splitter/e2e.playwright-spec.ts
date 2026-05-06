import { expect, Locator, Page, test } from '@playwright/test';

test.describe('KbqSplitter', () => {
    test.describe('ghost', () => {
        const getBlock = (page: Page) => page.getByTestId('e2eSplitterGhost');
        const getGutter = (block: Locator) => block.locator('.kbq-gutter');
        const getGhost = (block: Locator) => block.locator('.kbq-gutter-ghost');
        const getAreaByText = (block: Locator, text: string) => block.locator('.kbq-splitter-area', { hasText: text });

        const visibleClass = /(?:^|\s)kbq-gutter-ghost_visible(?:\s|$)/;

        test('should display ghost gutter after mousedown and hide after mouseup', async ({ page }) => {
            await page.goto('/E2eSplitterGhost');

            const block = getBlock(page);
            const gutter = getGutter(block);
            const ghost = getGhost(block);

            await expect(ghost).toBeHidden();
            await expect(ghost).not.toHaveClass(visibleClass);

            await gutter.hover();
            await page.mouse.down();

            await expect(ghost).toHaveClass(visibleClass);
            await expect(ghost).toBeVisible();

            await page.mouse.up();

            await expect(ghost).not.toHaveClass(visibleClass);
            await expect(ghost).toBeHidden();
        });

        test('should resize areas after releasing gutter', async ({ page }) => {
            await page.goto('/E2eSplitterGhost');

            const block = getBlock(page);
            const gutter = getGutter(block);
            const areaFirst = getAreaByText(block, 'first');
            const areaSecond = getAreaByText(block, 'second');

            const firstStart = await areaFirst.boundingBox();
            const secondStart = await areaSecond.boundingBox();

            if (!firstStart || !secondStart) throw new Error('bounding box is null');

            // Drag left so areaA shrinks and areaB grows; areaB has no min-width hit at this offset.
            const dragOffset = -30;

            await gutter.hover();
            const cursor = page.mouse;

            await cursor.down();
            // hover() left the cursor at gutter centre; offset relative to that.
            const gutterBox = await gutter.boundingBox();

            if (!gutterBox) throw new Error('bounding box is null');
            const startX = gutterBox.x + gutterBox.width / 2;
            const startY = gutterBox.y + gutterBox.height / 2;

            await cursor.move(startX + dragOffset, startY, { steps: 5 });
            await cursor.up();

            const firstEnd = await areaFirst.boundingBox();
            const secondEnd = await areaSecond.boundingBox();

            if (!firstEnd || !secondEnd) throw new Error('bounding box is null');

            expect(firstEnd.width).toBeCloseTo(firstStart.width + dragOffset, 0);
            expect(secondEnd.width).toBeCloseTo(secondStart.width - dragOffset, 0);
        });
    });
});
