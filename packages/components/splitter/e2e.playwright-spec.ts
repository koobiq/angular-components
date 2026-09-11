import { expect, Locator, Page, test } from '@playwright/test';

const getPanel = (page: Page, name: 'First' | 'Second' | 'Third') => page.getByTestId(`e2eSplitterPanel${name}`);
const getSeparator = (page: Page, index = 0) => page.locator('.kbq-splitter-panel__separator').nth(index);

/** Width of a panel, rounded — every expectation below is about layout, not about sub-pixel rounding. */
const widthOf = async (panel: Locator): Promise<number> => {
    const box = await panel.boundingBox();

    if (!box) throw new Error('bounding box is null');

    return Math.round(box.width);
};

const heightOf = async (panel: Locator): Promise<number> => {
    const box = await panel.boundingBox();

    if (!box) throw new Error('bounding box is null');

    return Math.round(box.height);
};

/** Drags the separator by `offset` pixels along `axis`, releasing at the end unless told otherwise. */
const dragSeparator = async (
    page: Page,
    offset: number,
    {
        axis = 'x',
        release = true,
        force = false,
        separator: index = 0,
        grab = 0.5
    }: { axis?: 'x' | 'y'; release?: boolean; force?: boolean; separator?: number; grab?: number } = {}
): Promise<void> => {
    const separator = getSeparator(page, index);
    // A disabled separator takes no pointer events, so its box has to be read without waiting for actionability.
    const box = force ? await separator.boundingBox({ timeout: 2000 }) : await separator.boundingBox();

    if (!box) throw new Error('bounding box is null');

    // `grab` picks where along the resize axis the drag starts, as a fraction of the hit area. The default
    // centre is not always usable: a separator sitting on the splitter's own edge has its outer half clipped
    // away by whatever box the splitter is in, and the centre then lands exactly on that clip edge.
    const startX = box.x + box.width * (axis === 'x' ? grab : 0.5);
    const startY = box.y + box.height * (axis === 'y' ? grab : 0.5);

    await page.mouse.move(startX, startY);
    await page.mouse.down();
    await page.mouse.move(startX + (axis === 'x' ? offset : 0), startY + (axis === 'y' ? offset : 0), { steps: 10 });

    if (release) await page.mouse.up();
};

test.describe('KbqSplitter', () => {
    test.describe('constraints', () => {
        test.beforeEach(async ({ page }) => {
            await page.goto('/E2eSplitterConstraints');
        });

        test('should give the panels an equal share of the splitter', async ({ page }) => {
            expect(await widthOf(getPanel(page, 'First'))).toBe(300);
            expect(await widthOf(getPanel(page, 'Second'))).toBe(300);
        });

        test('should move the boundary with the pointer', async ({ page }) => {
            await dragSeparator(page, -80);

            expect(await widthOf(getPanel(page, 'First'))).toBe(220);
            expect(await widthOf(getPanel(page, 'Second'))).toBe(380);
        });

        test('should size the panels through the grid rather than an inline size on them', async ({ page }) => {
            await dragSeparator(page, -80);

            // `KbqResizer` runs with `disableSizeUpdate`, so the drag reports sizes and writes none: a panel
            // carrying its own width would fight the track the splitter computed for it.
            for (const name of ['First', 'Second'] as const) {
                const style = await getPanel(page, name).evaluate((element) => element.getAttribute('style'));

                expect(style ?? '').not.toMatch(/width|height/);
            }
        });

        test('should stop at the minimum of the panel being shrunk', async ({ page }) => {
            await dragSeparator(page, -400);

            expect(await widthOf(getPanel(page, 'First'))).toBe(100);
            expect(await widthOf(getPanel(page, 'Second'))).toBe(500);
        });

        test('should stop at the maximum of the panel being grown', async ({ page }) => {
            await dragSeparator(page, 400);

            expect(await widthOf(getPanel(page, 'First'))).toBe(400);
            expect(await widthOf(getPanel(page, 'Second'))).toBe(200);
        });

        test('should advertise the direction that is still available through the cursor', async ({ page }) => {
            const separator = getSeparator(page);

            await expect(separator).toHaveCSS('cursor', 'col-resize');

            await dragSeparator(page, -400);
            await expect(separator).toHaveCSS('cursor', 'e-resize');

            await dragSeparator(page, 400);
            await expect(separator).toHaveCSS('cursor', 'w-resize');
        });

        test('should resize from the keyboard', async ({ page }) => {
            await getSeparator(page).focus();
            await page.keyboard.press('ArrowRight');
            await page.keyboard.press('ArrowRight');

            expect(await widthOf(getPanel(page, 'First'))).toBe(316);

            await page.keyboard.press('Home');

            expect(await widthOf(getPanel(page, 'First'))).toBe(100);

            await page.keyboard.press('End');

            expect(await widthOf(getPanel(page, 'First'))).toBe(400);
        });

        test('should keep the focus frame hidden while the separator is dragged with a pointer', async ({ page }) => {
            const separator = getSeparator(page);

            // Reached with Tab rather than `focus()`, because only a keyboard origin draws the frame at all.
            await page.keyboard.press('Tab');
            await expect(separator).toBeFocused();
            await expect(separator).toHaveClass(/cdk-keyboard-focused/);

            await dragSeparator(page, -40);
            await expect(separator).toBeFocused();
            await expect(separator).not.toHaveClass(/cdk-keyboard-focused/);
        });
    });

    test.describe('collapsing', () => {
        test.beforeEach(async ({ page }) => {
            await page.goto('/E2eSplitterCollapsible');
        });

        test('should wait at the minimum and flip sides at the midpoint', async ({ page }) => {
            const panel = getPanel(page, 'First');
            const box = await getSeparator(page).boundingBox();

            if (!box) throw new Error('bounding box is null');

            const x = box.x + box.width / 2;
            const y = box.y + box.height / 2;

            await page.mouse.move(x, y);
            await page.mouse.down();

            // Pointer at 100px, inside the gap between the 40px collapsed size and the 160px minimum: the panel
            // waits at the minimum rather than following it into a size it can never settle at.
            await page.mouse.move(x - 200, y, { steps: 10 });
            expect(await widthOf(panel)).toBe(160);

            // Past the 80px midpoint it flips to the other side of the gap in one step.
            await page.mouse.move(x - 240, y, { steps: 5 });
            expect(await widthOf(panel)).toBe(40);

            // And back at the same point, because the midpoint decides the same way whichever way it is crossed.
            await page.mouse.move(x - 200, y, { steps: 5 });
            expect(await widthOf(panel)).toBe(160);

            await page.mouse.up();
            expect(await widthOf(panel)).toBe(160);
        });

        test('should collapse when the drag is released below half the minimum', async ({ page }) => {
            await dragSeparator(page, -222);

            expect(await widthOf(getPanel(page, 'First'))).toBe(40);
        });

        test('should open at the minimum when the drag is released above half the minimum', async ({ page }) => {
            await dragSeparator(page, -218);

            expect(await widthOf(getPanel(page, 'First'))).toBe(160);
        });

        test('should decide the same way whichever side the drag came from', async ({ page }) => {
            const panel = getPanel(page, 'First');

            // Half the minimum is the midpoint of the gap, so it settles a release identically in both
            // directions: 100px from 300px open and 100px from 40px collapsed are the same gesture end.
            await dragSeparator(page, -200);

            expect(await widthOf(panel)).toBe(160);

            await dragSeparator(page, -260);

            expect(await widthOf(panel)).toBe(40);

            await dragSeparator(page, 60);

            expect(await widthOf(panel)).toBe(160);
        });

        test('should keep a collapsed panel closed when the drag falls short of the midpoint', async ({ page }) => {
            await dragSeparator(page, -300);

            expect(await widthOf(getPanel(page, 'First'))).toBe(40);

            // 40 + 30 is still under the 80px midpoint, so releasing here leaves the panel where it was.
            await dragSeparator(page, 30);

            expect(await widthOf(getPanel(page, 'First'))).toBe(40);

            await dragSeparator(page, 220);

            expect(await widthOf(getPanel(page, 'First'))).toBe(260);
        });

        test('should collapse and expand from the keyboard', async ({ page }) => {
            await getSeparator(page).focus();
            await page.keyboard.press('Enter');

            expect(await widthOf(getPanel(page, 'First'))).toBe(40);

            await page.keyboard.press('Enter');

            expect(await widthOf(getPanel(page, 'First'))).toBe(300);
        });
    });

    test.describe('snapping', () => {
        test.beforeEach(async ({ page }) => {
            await page.goto('/E2eSplitterSnap');
        });

        test('should pull the boundary onto a snap size it stops near', async ({ page }) => {
            await dragSeparator(page, 85);

            expect(await widthOf(getPanel(page, 'First'))).toBe(400);
        });

        test('should leave a boundary that stops far from every snap size', async ({ page }) => {
            await dragSeparator(page, 40);

            expect(await widthOf(getPanel(page, 'First'))).toBe(340);
        });

        test('should settle the initial layout onto a snap size', async ({ page }) => {
            await page.goto('/E2eSplitterSnapTolerance');

            // An equal share would open the splitter at 300px — a size that, with points pulling this far,
            // no release can reach either.
            expect(await widthOf(getPanel(page, 'Second'))).toBe(200);
        });

        test('should reach further when the panel widens its threshold', async ({ page }) => {
            await page.goto('/E2eSplitterSnapTolerance');

            // Released with the panel at 340px — 60px from its 400px snap point, past the 32px default but
            // well inside the 150px this panel asks for.
            await dragSeparator(page, -140);

            expect(await widthOf(getPanel(page, 'Second'))).toBe(400);
        });

        test('should still leave a release beyond the widened threshold alone', async ({ page }) => {
            await page.goto('/E2eSplitterSnapTolerance');

            // 160px from the nearer snap point, so even the widened pull does not reach.
            await dragSeparator(page, 160);

            expect(await widthOf(getPanel(page, 'Second'))).toBe(40);
        });

        test('should follow the pointer exactly until the drag is released', async ({ page }) => {
            // Held 15px short of the snap point the release will pull it onto — the boundary must not stick
            // mid-drag, which would freeze the panel and then jump once the pointer broke free.
            await dragSeparator(page, 85, { release: false });

            expect(await widthOf(getPanel(page, 'First'))).toBe(385);

            await page.mouse.up();

            expect(await widthOf(getPanel(page, 'First'))).toBe(400);
        });
    });

    test.describe('nested in a collapsed layout', () => {
        test.beforeEach(async ({ page }) => {
            await page.goto('/E2eSplitterNestedCollapsed');
        });

        test('should not scroll the box it sits in when its separator takes focus', async ({ page }) => {
            const content = page.getByTestId('e2eSplitterPanelHost').locator('> .kbq-splitter-panel__content');
            const editor = page.getByTestId('e2eSplitterPanelSecond');
            const height = await heightOf(editor);

            // The panel below is collapsed to nothing, so this separator sits on the nested splitter's own
            // bottom edge and half of it hangs outside the box above — which clips its content.
            await dragSeparator(page, -20, { axis: 'y', separator: 1, grab: 0.25 });

            // The drag has to have started for the assertion below to mean anything.
            await expect(getSeparator(page, 1)).toBeFocused();
            expect(await content.evaluate((element) => element.scrollTop)).toBe(0);
            expect(await heightOf(editor)).toBe(height);
        });
    });

    test.describe('constraints that cannot be satisfied', () => {
        test('should hold each panel at its minimum rather than rescale them to fit', async ({ page }) => {
            await page.goto('/E2eSplitterUnsatisfiableMinimums');

            // 750px of minimums in a 600px splitter. Written as ratios the tracks would be normalised to ~199px
            // each, breaking every declared minimum while the layout and `aria-valuenow` still said 250.
            for (const name of ['First', 'Second', 'Third'] as const) {
                expect(await widthOf(getPanel(page, name))).toBe(250);
            }
        });
    });

    test.describe('percentage sizes', () => {
        // A 600px splitter, so `25%` is 150px and every expectation below is a whole pixel.
        test.beforeEach(async ({ page }) => {
            await page.goto('/E2eSplitterPercentSizes');
        });

        test('should open at the declared percentage', async ({ page }) => {
            expect(await widthOf(getPanel(page, 'First'))).toBe(150);
            expect(await widthOf(getPanel(page, 'Second'))).toBe(450);
        });

        test('should stop at a percentage maximum', async ({ page }) => {
            await dragSeparator(page, 300);

            expect(await widthOf(getPanel(page, 'First'))).toBe(300);
        });

        test('should stop at a percentage minimum', async ({ page }) => {
            await dragSeparator(page, -200);

            expect(await widthOf(getPanel(page, 'First'))).toBe(60);
        });

        test('should pull the boundary onto a percentage snap size', async ({ page }) => {
            // Released 20px short of the 40% mark — inside the default 32px tolerance.
            await dragSeparator(page, 70);

            expect(await widthOf(getPanel(page, 'First'))).toBe(240);
        });
    });

    test.describe('nested across the other axis', () => {
        // The outer splitter is vertical and disabled, the nested one horizontal and enabled — so nothing here
        // passes unless each splitter's styles reach its own panels only.
        test.beforeEach(async ({ page }) => {
            await page.goto('/E2eSplitterNestedCrossAxis');
        });

        test('should draw a nested separator along its own axis', async ({ page }) => {
            const separator = getSeparator(page, 0);
            const box = (await separator.boundingBox())!;

            // A vertical separator: a thin line spanning the height of the splitter it belongs to.
            expect(Math.round(box.height)).toBe(await heightOf(page.getByTestId('e2eSplitterNested')));
            expect(box.width).toBeLessThan(box.height);
        });

        test('should keep a nested splitter draggable inside a disabled one', async ({ page }) => {
            const width = await widthOf(getPanel(page, 'First'));

            await dragSeparator(page, 60);

            expect(await widthOf(getPanel(page, 'First'))).toBe(width + 60);
        });
    });

    test.describe('nested as a flex item', () => {
        test('should hold its own size while a panel sits pinned to a collapsed strip', async ({ page }) => {
            await page.goto('/E2eSplitterNestedFlex');

            const nested = page.getByTestId('e2eSplitterNested');
            const before = await heightOf(nested);

            // Held rather than released: the panel is pinned to its 20px collapsed strip only while the drag
            // is in progress, and that strip is shorter than the content it holds.
            await dragSeparator(page, 60, { axis: 'y', separator: 1, release: false });

            expect(await heightOf(getPanel(page, 'Second'))).toBe(20);
            expect(await heightOf(nested)).toBe(before);

            await page.mouse.up();
        });
    });

    test.describe('a neighbour at its maximum', () => {
        const getThird = (page: Page) => page.getByTestId('e2eSplitterPanelThird');

        test.beforeEach(async ({ page }) => {
            await page.goto('/E2eSplitterCappedNeighbour');
        });

        test('should still let the boundary move, handing the delta to the panel further out', async ({ page }) => {
            // The middle panel starts pinned at its 200px maximum.
            expect(await widthOf(getPanel(page, 'Second'))).toBe(200);

            const first = await widthOf(getPanel(page, 'First'));
            const third = await widthOf(getThird(page));

            await dragSeparator(page, 60, { separator: 1 });

            expect(await widthOf(getPanel(page, 'First'))).toBe(first + 60);
            expect(await widthOf(getPanel(page, 'Second'))).toBe(200);
            expect(await widthOf(getThird(page))).toBe(third - 60);
        });

        test('should stop the trailing panel at its own minimum', async ({ page }) => {
            await dragSeparator(page, 400, { separator: 1 });

            expect(await widthOf(getThird(page))).toBe(125);
        });

        test('should keep the resize cursor on a boundary that only the outward walk can move', async ({ page }) => {
            await expect(page.locator('.kbq-splitter-panel__separator').nth(1)).toHaveCSS('cursor', 'col-resize');
        });
    });

    test.describe('panel content', () => {
        test('should be a column flex container, which is what lets content fill a panel with flex: 1', async ({
            page
        }) => {
            await page.goto('/E2eSplitterConstraints');

            const content = page.locator('.kbq-splitter-panel__content').first();

            await expect(content).toHaveCSS('display', 'flex');
            await expect(content).toHaveCSS('flex-direction', 'column');
            // Still clipped rather than squashed — the reason the panel wraps its content at all.
            await expect(content).toHaveCSS('overflow', 'hidden');
        });
    });

    test.describe('disabled', () => {
        /** Colour of the separator line — what the hover and active states would otherwise change. */
        const lineColor = (page: Page) =>
            getSeparator(page).evaluate((element) => getComputedStyle(element, '::after').backgroundColor);

        test('should not light up under the pointer', async ({ page }) => {
            await page.goto('/E2eSplitterDisabled');

            const separator = getSeparator(page);
            const resting = await lineColor(page);

            await separator.hover({ force: true });

            expect(await lineColor(page)).toBe(resting);

            await page.mouse.down();

            expect(await lineColor(page)).toBe(resting);

            await page.mouse.up();
        });

        test('should not move the boundary when dragged', async ({ page }) => {
            await page.goto('/E2eSplitterDisabled');

            const before = await widthOf(getPanel(page, 'First'));

            await dragSeparator(page, -80, { force: true });

            expect(await widthOf(getPanel(page, 'First'))).toBe(before);
        });

        test('should light up under the pointer when the splitter is enabled', async ({ page }) => {
            // The control for the two tests above: without it they would also pass if the line were unstyled.
            await page.goto('/E2eSplitterConstraints');

            const separator = getSeparator(page);
            const resting = await lineColor(page);

            await separator.hover();

            expect(await lineColor(page)).not.toBe(resting);
        });
    });

    test.describe('transparent appearance', () => {
        /** Opacity of the separator line, which is what the transparent appearance keeps at zero. */
        const lineOpacity = (page: Page) =>
            getSeparator(page).evaluate((element) => getComputedStyle(element, '::after').opacity);

        test.beforeEach(async ({ page }) => {
            await page.goto('/E2eSplitterAppearance');
        });

        test('should keep the line hidden while the cursor still advertises the resize', async ({ page }) => {
            const separator = getSeparator(page);

            expect(await lineOpacity(page)).toBe('0');

            await separator.hover();

            // The whole point of this appearance: hovering reveals nothing, only the cursor gives it away.
            expect(await lineOpacity(page)).toBe('0');
            await expect(separator).toHaveCSS('cursor', 'col-resize');
        });

        test('should keep the line hidden while the separator is being dragged', async ({ page }) => {
            await dragSeparator(page, -60, { release: false });

            expect(await lineOpacity(page)).toBe('0');
            expect(await widthOf(getPanel(page, 'First'))).toBe(240);

            await page.mouse.up();

            expect(await lineOpacity(page)).toBe('0');
        });

        test('should still show the keyboard focus frame, the only indicator this appearance has', async ({ page }) => {
            const separator = getSeparator(page);

            await page.keyboard.press('Tab');
            await expect(separator).toBeFocused();
            await expect(separator).toHaveClass(/cdk-keyboard-focused/);
            await expect(separator).not.toHaveCSS('outline-style', 'none');

            // The frame appears, the line does not.
            expect(await lineOpacity(page)).toBe('0');
        });

        test('should show the line for the divider appearance, which is what transparent differs from', async ({
            page
        }) => {
            await page.goto('/E2eSplitterConstraints');

            expect(await lineOpacity(page)).toBe('1');
        });
    });

    test.describe('vertical', () => {
        test.beforeEach(async ({ page }) => {
            await page.goto('/E2eSplitterVertical');
        });

        test('should resize along the block axis', async ({ page }) => {
            await expect(getSeparator(page)).toHaveCSS('cursor', 'row-resize');

            await dragSeparator(page, -30, { axis: 'y' });

            expect(await heightOf(getPanel(page, 'First'))).toBe(70);
            expect(await heightOf(getPanel(page, 'Second'))).toBe(130);
        });
    });
});
