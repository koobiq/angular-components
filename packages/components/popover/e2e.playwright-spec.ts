import { expect, Locator, Page, test } from '@playwright/test';
import { e2eEnableDarkTheme, e2eHasOverflowShadow } from '../../e2e/utils';

/** Pins the popover trigger's wrapper so it lands at a known viewport spot. */
async function pinTrigger(page: Page, testId: string, coords: { top?: number; bottom?: number; left?: number }) {
    await page.evaluate(
        ({ testId, coords }) => {
            const el = document.querySelector<HTMLElement>(`[data-testid="${testId}"]`);

            if (!el) return;

            el.style.position = 'fixed';
            if (coords.top !== undefined) el.style.top = `${coords.top}px`;
            if (coords.bottom !== undefined) el.style.bottom = `${coords.bottom}px`;
            if (coords.left !== undefined) el.style.left = `${coords.left}px`;
        },
        { testId, coords }
    );
}

/**
 * Probes the trigger↔popover gap adaptively: unlike the connected dropdowns, popover's gap is a CSS `margin`
 * on the popup body (`.kbq-popover`) applied on whichever side the popover lands (top/bottom/left/right), so the
 * probe derives the gap side from the live trigger/container rects and samples the midpoint of that band.
 * Reports whether the point resolves to the overlay pane (gap covered → not click/hover-through) and whether it
 * lands inside the visible body `.kbq-popover__container` (should be false — the point is genuinely in the gap,
 * not on real content, so a pass can't be faked by the popover simply rendering flush with no gap).
 */
async function probePopoverGap(
    page: Page,
    triggerTestId: string
): Promise<{ found: boolean; side: string | null; closestPane: boolean; closestContainer: boolean }> {
    return page.evaluate((triggerTestId) => {
        const trigger = document.querySelector<HTMLElement>(`[data-testid="${triggerTestId}"]`);
        const container = document.querySelector<HTMLElement>('.kbq-popover__container');

        if (!trigger || !container) return { found: false, side: null, closestPane: false, closestContainer: false };

        const t = trigger.getBoundingClientRect();
        const c = container.getBoundingClientRect();
        const crossX = Math.round((Math.max(t.left, c.left) + Math.min(t.right, c.right)) / 2);
        const crossY = Math.round((Math.max(t.top, c.top) + Math.min(t.bottom, c.bottom)) / 2);

        let side: string;
        let x: number;
        let y: number;

        if (c.top >= t.bottom - 1) {
            side = 'below';
            x = crossX;
            y = Math.round((t.bottom + c.top) / 2);
        } else if (c.bottom <= t.top + 1) {
            side = 'above';
            x = crossX;
            y = Math.round((c.bottom + t.top) / 2);
        } else if (c.left >= t.right - 1) {
            side = 'right';
            x = Math.round((t.right + c.left) / 2);
            y = crossY;
        } else {
            side = 'left';
            x = Math.round((c.right + t.left) / 2);
            y = crossY;
        }

        const el = document.elementFromPoint(x, y);

        return {
            found: true,
            side,
            closestPane: !!el?.closest('.cdk-overlay-pane'),
            closestContainer: !!el?.closest('.kbq-popover__container')
        };
    }, triggerTestId);
}

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

            await expect.poll(() => e2eHasOverflowShadow(mediumPopover.locator('.kbq-popover__footer'))).toBeTruthy();
        });

        test('should show header shadow after scrolling down', async ({ page }) => {
            await page.goto('/E2ePopoverStates');
            const mediumPopover = page.locator('.kbq-popover_medium').first();

            await expect(mediumPopover).toBeVisible();

            await mediumPopover.locator('.kbq-popover__content').evaluate((el) => {
                el.scrollTop = 50;
            });

            await expect.poll(() => e2eHasOverflowShadow(mediumPopover.locator('.kbq-popover__header'))).toBeTruthy();
        });

        test('should show both shadows when scrolled to the middle', async ({ page }) => {
            await page.goto('/E2ePopoverStates');
            const mediumPopover = page.locator('.kbq-popover_medium').first();

            await expect(mediumPopover).toBeVisible();

            await mediumPopover.locator('.kbq-popover__content').evaluate((el) => {
                el.scrollTop = Math.floor((el.scrollHeight - el.clientHeight) / 2);
            });

            await expect.poll(() => e2eHasOverflowShadow(mediumPopover.locator('.kbq-popover__header'))).toBeTruthy();
            await expect.poll(() => e2eHasOverflowShadow(mediumPopover.locator('.kbq-popover__footer'))).toBeTruthy();
        });
    });

    // Unlike the connected dropdowns (select/tree-select/…), popover never used a physical CDK `offsetY` for its
    // gap: the gap is a `margin` on the popup body, which lives inside the `pointer-events: auto` overlay pane, so
    // the band is already covered and not click/hover-through. These guard that property against regressions (e.g.
    // switching to a physical offset, dropping the body margin, or making the pane ignore pointer events).
    test.describe('trigger↔panel gap is not click-through', () => {
        test('the gap belongs to the overlay pane, not real popover content', async ({ page }) => {
            await page.goto('/E2ePopoverPositioning');
            await pinTrigger(page, 'e2eFormField', { top: 120, left: 120 });

            await page.getByTestId('e2ePopoverTrigger').click();
            await page.locator('.kbq-popover__container').waitFor();

            const probe = await probePopoverGap(page, 'e2ePopoverTrigger');

            // A point in the trigger↔body gap band must resolve to the overlay pane (covered) but not to the
            // visible body — so it is not click-through, and the pass is not faked by a zero-gap flush layout.
            expect(probe.found).toBe(true);
            expect(probe.closestPane).toBe(true);
            expect(probe.closestContainer).toBe(false);
        });

        test('a hover-triggered popover stays open while the cursor is in the gap', async ({ page }) => {
            await page.goto('/E2ePopoverPositioning');
            await pinTrigger(page, 'e2eFormFieldHover', { top: 120, left: 120 });

            const trigger = page.getByTestId('e2ePopoverTriggerHover');
            const container = page.locator('.kbq-popover__container');

            await trigger.hover();
            await container.waitFor();

            // Move the cursor off the trigger and into the trigger↔body gap band. Because that band is inside
            // the pane, hovering it keeps the popover open (the gap is a hover bridge, not a dead zone).
            const gapPoint = await page.evaluate(() => {
                const t = document
                    .querySelector<HTMLElement>('[data-testid="e2ePopoverTriggerHover"]')!
                    .getBoundingClientRect();
                const c = document.querySelector<HTMLElement>('.kbq-popover__container')!.getBoundingClientRect();
                const crossX = Math.round((Math.max(t.left, c.left) + Math.min(t.right, c.right)) / 2);
                const crossY = Math.round((Math.max(t.top, c.top) + Math.min(t.bottom, c.bottom)) / 2);

                if (c.top >= t.bottom - 1) return { x: crossX, y: Math.round((t.bottom + c.top) / 2) };
                if (c.bottom <= t.top + 1) return { x: crossX, y: Math.round((c.bottom + t.top) / 2) };
                if (c.left >= t.right - 1) return { x: Math.round((t.right + c.left) / 2), y: crossY };

                return { x: Math.round((c.right + t.left) / 2), y: crossY };
            });

            await page.mouse.move(gapPoint.x, gapPoint.y);
            // Longer than the hover leaveDelay (500ms): if the gap were a dead zone the popover would have closed.
            await page.waitForTimeout(800);

            await expect(container).toBeVisible();
        });
    });
});
