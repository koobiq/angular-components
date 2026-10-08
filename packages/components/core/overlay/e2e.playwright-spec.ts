import { expect, Locator, Page, test } from '@playwright/test';
import { e2eEnableDarkTheme, e2eWaitForFonts, e2eWaitForSettledScrollbars } from '../../../e2e/utils';

/** Distance kept from the bar's bottom edge, so a hit test lands clearly on one side of it. */
const EDGE_OFFSET = 8;
const PAINT_TARGETS = ['.cdk-overlay-pane', '.kbq-top-bar'];

const getGlobalPanes = (page: Page) => page.locator('body > .cdk-overlay-container .cdk-overlay-pane');
const getLayerPanes = (page: Page) => page.getByTestId('e2eOverlayLayerContent').locator('.cdk-overlay-pane');

/** Waits until the box stops moving, e.g. while a panel is repositioned after a scroll. */
const boundingBoxAtRest = async (locator: Locator) => {
    let previous = '';

    await expect
        .poll(async () => {
            const current = JSON.stringify(await locator.boundingBox());
            const settled = current !== 'null' && current === previous;

            previous = current;

            return settled;
        })
        .toBe(true);

    return (await locator.boundingBox())!;
};

/** Which of {@link PAINT_TARGETS} paints at the point, or `null`. */
const getPaintTargetAt = (page: Page, x: number, y: number) =>
    page.evaluate(
        ({ x, y, targets }) => {
            const element = document.elementFromPoint(x, y);

            return targets.find((target) => element?.closest(target)) ?? null;
        },
        { x, y, targets: PAINT_TARGETS }
    );

test.describe('KbqOverlayLayer', () => {
    test.describe('E2eOverlayLayerStickyBar', () => {
        const getComponent = (page: Page) => page.getByTestId('e2eOverlayLayerStickyBar');
        const getScroller = (page: Page) => page.getByTestId('e2eOverlayLayerScroller');
        const getBarBottom = async (page: Page) => {
            const box = (await getComponent(page).locator('kbq-top-bar').boundingBox())!;

            return box.y + box.height;
        };

        test('slides a panel opened from the content under the bar', async ({ page }) => {
            await page.goto('/E2eOverlayLayerStickyBar');
            // The panel is measured once, on open.
            await e2eWaitForFonts(page);

            await page.getByTestId('e2eOverlayLayerSelect').click();
            await expect(getLayerPanes(page)).toHaveCount(1);
            await expect(getGlobalPanes(page)).toHaveCount(0);

            // Puts the select at the top of the bar, so the panel below it starts under the bar.
            const scrollTop = await getScroller(page).evaluate((scroller) => {
                const select = scroller.querySelector('kbq-select')!;

                return Math.round(
                    scroller.scrollTop + select.getBoundingClientRect().top - scroller.getBoundingClientRect().top
                );
            });

            await getScroller(page).evaluate((scroller, top) => scroller.scrollTo({ top }), scrollTop);
            await expect(getScroller(page)).toHaveJSProperty('scrollTop', scrollTop);

            const paneBox = await boundingBoxAtRest(getLayerPanes(page));
            const barBottom = await getBarBottom(page);
            const x = paneBox.x + paneBox.width / 2;

            expect(paneBox.y).toBeLessThan(barBottom - EDGE_OFFSET);
            expect(await getPaintTargetAt(page, x, barBottom - EDGE_OFFSET)).toBe('.kbq-top-bar');
            expect(await getPaintTargetAt(page, x, barBottom + EDGE_OFFSET)).toBe('.cdk-overlay-pane');

            await e2eWaitForSettledScrollbars(page, 1);

            await expect(getComponent(page)).toHaveScreenshot('01-light.png');
            await e2eEnableDarkTheme(page);
            await expect(getComponent(page)).toHaveScreenshot('01-dark.png');
        });

        test('keeps a panel opened from the bar above the bar', async ({ page }) => {
            await page.goto('/E2eOverlayLayerStickyBar');

            await page.getByTestId('e2eOverlayLayerBarTrigger').click();
            await expect(getGlobalPanes(page)).toHaveCount(1);
            await expect(getLayerPanes(page)).toHaveCount(0);

            const paneBox = await boundingBoxAtRest(getGlobalPanes(page));
            const barBottom = await getBarBottom(page);

            expect(paneBox.y).toBeLessThan(barBottom);
            expect(await getPaintTargetAt(page, paneBox.x + paneBox.width / 2, (paneBox.y + barBottom) / 2)).toBe(
                '.cdk-overlay-pane'
            );
        });
    });

    test.describe('E2eOverlayLayerGlobalOverlays', () => {
        test.beforeEach(async ({ page }) => {
            await page.goto('/E2eOverlayLayerGlobalOverlays');
        });

        test('keeps a tooltip in the application-wide container', async ({ page }) => {
            await page.getByTestId('e2eOverlayLayerTooltipTrigger').hover();

            await expect(getGlobalPanes(page)).toHaveCount(1);
            await expect(getLayerPanes(page)).toHaveCount(0);
        });

        test('keeps a panel opened from a bar inside the content in the application-wide container', async ({
            page
        }) => {
            await page.getByTestId('e2eOverlayLayerBarTrigger').click();

            await expect(getGlobalPanes(page)).toHaveCount(1);
            await expect(getLayerPanes(page)).toHaveCount(0);
        });

        test('keeps a select inside a modal declared in the content above the modal', async ({ page }) => {
            await page.getByTestId('e2eOverlayLayerModalTrigger').click();
            await page.getByTestId('e2eOverlayLayerModalSelect').click();

            await expect(getGlobalPanes(page).and(page.locator('.kbq-select-overlay'))).toHaveCount(1);
            await expect(getLayerPanes(page)).toHaveCount(0);
        });

        test('puts a select opened from a layered popover into the same layer', async ({ page }) => {
            await page.getByTestId('e2eOverlayLayerPopoverTrigger').click();
            await page.getByTestId('e2eOverlayLayerPopoverSelect').click();

            await expect(getLayerPanes(page)).toHaveCount(2);
            await expect(getGlobalPanes(page)).toHaveCount(0);
        });
    });
});
