import { expect, Locator, Page, test } from '@playwright/test';
import { e2eEnableDarkTheme } from '../../e2e/utils';

test.describe('KbqButtonToggleModule', () => {
    type Box = { x: number; y: number; width: number; height: number };

    /**
     * An item paints a pill smaller than the space the group gives it, and the `gap` and `padding`
     * around it answer the pointer too — see the `::before` in button-toggle.scss. Nothing about the
     * rendered pixels changes, so a baseline cannot cover any of this. The two helpers below are shared
     * by the harnesses that exercise it, which size their pills differently.
     */

    /** Border boxes of the buttons that paint the pills, in document order. */
    const getPillBoxes = (group: Locator): Promise<Box[]> =>
        group.evaluate((element) =>
            Array.from(element.querySelectorAll(':scope > kbq-button-toggle > button')).map((button) => {
                const { x, y, width, height } = button.getBoundingClientRect();

                return { x, y, width, height };
            })
        );

    /**
     * Which item owns a viewport point, as the browser's own hit testing resolves it. The tag must
     * come back `button` rather than the item host: the button is what carries the click handler.
     */
    const getOwnerAt = (page: Page, x: number, y: number) =>
        page.evaluate(
            ([pointX, pointY]) => {
                const element = document.elementFromPoint(pointX, pointY);
                const toggle = element?.closest('kbq-button-toggle');

                return {
                    tag: element ? element.tagName.toLowerCase() : null,
                    index: toggle ? Array.from(toggle.parentElement!.children).indexOf(toggle) : -1
                };
            },
            [x, y]
        );

    /** The states the harnesses render, in their order: one table column, or one stretched group, each. */
    const states = ['disabled', 'checked', 'normal', 'hover', 'active', 'focus', 'progress'];

    test.describe('E2eButtonToggleStates', () => {
        const getComponent = (page: Page) => page.getByTestId('e2eButtonToggleStates');
        const togglePrefix = (locator: Locator) => locator.getByTestId('e2eShowPrefixIcon').click();
        const toggleTitle = (locator: Locator) => locator.getByTestId('e2eShowTitle').click();
        const toggleSuffix = (locator: Locator) => locator.getByTestId('e2eShowSuffixIcon').click();
        const getScreenshotTarget = (locator: Locator) => locator.getByTestId('e2eScreenshotTarget');

        test('with title', async ({ page }) => {
            await page.goto('/E2eButtonToggleStates');
            const locator = getComponent(page);

            await expect(getScreenshotTarget(locator)).toHaveScreenshot('01-light.png');
        });

        test('with icon', async ({ page }) => {
            await page.goto('/E2eButtonToggleStates');
            const locator = getComponent(page);

            await togglePrefix(locator);
            await toggleTitle(locator);

            await expect(getScreenshotTarget(locator)).toHaveScreenshot('02-light.png');
        });

        test('with title, prefix and suffix', async ({ page }) => {
            await page.goto('/E2eButtonToggleStates');
            const locator = getComponent(page);

            await togglePrefix(locator);
            await toggleSuffix(locator);

            await expect(getScreenshotTarget(locator)).toHaveScreenshot('03-light.png');
            await e2eEnableDarkTheme(page);
            await expect(getScreenshotTarget(locator)).toHaveScreenshot('03-dark.png');
        });

        test.describe('hit area', () => {
            /**
             * One group of the harness table: its rows are the orientations (horizontal, horizontal
             * `multiple`, vertical, vertical `multiple`) and its columns the states — `normal` is the only
             * one whose items carry neither a faked state class nor `disabled`. `iconOnly` drops the first
             * item's label; `default 2`/`default 3` keep theirs either way. Scrolled into view because
             * `elementFromPoint` answers `null` outside the viewport, and the table is oversized.
             */
            const openGroup = async (page: Page, { vertical = false, state = 'normal', iconOnly = false } = {}) => {
                await page.goto('/E2eButtonToggleStates');

                const locator = getComponent(page);

                if (iconOnly) {
                    await togglePrefix(locator);
                    await toggleTitle(locator);
                }

                const group = getScreenshotTarget(locator)
                    .locator('tr')
                    .nth(vertical ? 2 : 0)
                    .locator('td')
                    .nth(states.indexOf(state))
                    .locator('kbq-button-toggle-group');

                await group.scrollIntoViewIfNeeded();

                return group;
            };

            /** `along` is the axis the items run on, `across` the other, so both orientations read alike. */
            const getAxes = (page: Page, vertical: boolean) => ({
                at: (along: number, across: number) =>
                    vertical ? getOwnerAt(page, across, along) : getOwnerAt(page, along, across),
                along: (box: Box) => (vertical ? [box.y, box.y + box.height] : [box.x, box.x + box.width]),
                across: (box: Box) => (vertical ? [box.x, box.x + box.width] : [box.y, box.y + box.height]),
                alongCentre: (box: Box) => (vertical ? box.y + box.height / 2 : box.x + box.width / 2),
                acrossCentre: (box: Box) => (vertical ? box.x + box.width / 2 : box.y + box.height / 2),
                alongEnd: (box: Box) => (vertical ? box.y + box.height : box.x + box.width)
            });

            for (const vertical of [false, true]) {
                const orientation = vertical ? 'vertical' : 'horizontal';

                test(`hands the gap between two items over at its midline, ${orientation}`, async ({ page }) => {
                    const axes = getAxes(page, vertical);
                    const [first, second] = await getPillBoxes(await openGroup(page, { vertical }));
                    const gapMid = (axes.alongEnd(first) + axes.along(second)[0]) / 2;
                    const across = axes.acrossCentre(first);

                    // no dead strip in between, and no overlap either
                    expect(await axes.at(gapMid - 1, across)).toEqual({ tag: 'button', index: 0 });
                    expect(await axes.at(gapMid + 1, across)).toEqual({ tag: 'button', index: 1 });
                });

                test(`reaches into the padding the group frames its items with, ${orientation}`, async ({ page }) => {
                    const axes = getAxes(page, vertical);
                    const group = await openGroup(page, { vertical });
                    const box = (await group.boundingBox())!;
                    const pills = await getPillBoxes(group);
                    const last = pills.length - 1;
                    const [alongStart, alongEnd] = axes.along(box);
                    const [acrossStart, acrossEnd] = axes.across(box);

                    // the outermost items have no neighbour to share with, so they take the padding whole
                    expect(await axes.at(alongStart + 1, axes.acrossCentre(pills[0]))).toEqual({
                        tag: 'button',
                        index: 0
                    });
                    expect(await axes.at(alongEnd - 1, axes.acrossCentre(pills[last]))).toEqual({
                        tag: 'button',
                        index: last
                    });

                    // and on the cross axis every item does, on both sides — the offset comes from the
                    // rule none of the positional selectors touch, so a middle item is as much of a
                    // case as the two ends
                    for (let index = 0; index < pills.length; index++) {
                        const alongCentre = axes.alongCentre(pills[index]);

                        expect(await axes.at(alongCentre, acrossStart + 1)).toEqual({ tag: 'button', index });
                        expect(await axes.at(alongCentre, acrossEnd - 1)).toEqual({ tag: 'button', index });
                    }
                });
            }

            test('keeps a disabled item in charge of its own half of the gap', async ({ page }) => {
                const group = await openGroup(page, { state: 'disabled' });
                const buttons = group.locator('kbq-button-toggle > button');
                const [first, second] = await getPillBoxes(group);
                const gapMid = (first.x + first.width + second.x) / 2;
                const across = first.y + first.height / 2;

                await expect(buttons.first()).toBeDisabled();

                // the split is drawn the same either way: a disabled item's share of the gutter is
                // still its own, rather than a wider catchment for the enabled neighbour
                expect(await getOwnerAt(page, gapMid - 1, across)).toEqual({ tag: 'button', index: 0 });
                expect(await getOwnerAt(page, gapMid + 1, across)).toEqual({ tag: 'button', index: 1 });

                await page.mouse.click(gapMid - 1, across);

                // and what lands on that share is swallowed, not handed to either neighbour
                await expect(buttons.nth(0)).not.toHaveClass(/kbq-selected/);
                await expect(buttons.nth(1)).not.toHaveClass(/kbq-selected/);
            });

            test('claims the same gutters for an icon-only item', async ({ page }) => {
                // an item with nothing but an icon in it is the narrowest pill a group hands a gutter to
                const group = await openGroup(page, { iconOnly: true });
                const box = (await group.boundingBox())!;
                const [first, second] = await getPillBoxes(group);
                const across = first.y + first.height / 2;

                expect(await getOwnerAt(page, box.x + 1, across)).toEqual({ tag: 'button', index: 0 });
                expect(await getOwnerAt(page, (first.x + first.width + second.x) / 2 - 1, across)).toEqual({
                    tag: 'button',
                    index: 0
                });
                expect(await getOwnerAt(page, (first.x + first.width + second.x) / 2 + 1, across)).toEqual({
                    tag: 'button',
                    index: 1
                });
            });

            test('paints the hover state from a pointer in the gap', async ({ page }) => {
                const group = await openGroup(page);
                const second = group.locator('kbq-button-toggle').nth(1).locator('button');
                const [first, secondBox] = await getPillBoxes(group);
                const getBackground = () =>
                    second.evaluate((element: HTMLElement) => getComputedStyle(element).backgroundColor);

                const before = await getBackground();

                // 1px past the midline, i.e. still outside the pill this must light up
                await page.mouse.move((first.x + first.width + secondBox.x) / 2 + 1, first.y + first.height / 2);

                expect(await getBackground()).not.toBe(before);
            });

            test('activates a toggle from a click in the gap', async ({ page }) => {
                const group = await openGroup(page);
                const second = group.locator('kbq-button-toggle').nth(1).locator('button');
                const [first, secondBox] = await getPillBoxes(group);

                await expect(second).not.toHaveClass(/kbq-selected/);

                await page.mouse.click((first.x + first.width + secondBox.x) / 2 + 1, first.y + first.height / 2);

                await expect(second).toHaveClass(/kbq-selected/);
            });

            test('mirrors the outermost offsets under dir="rtl"', async ({ page }) => {
                const group = await openGroup(page);

                await page.evaluate(() => document.documentElement.setAttribute('dir', 'rtl'));

                const box = (await group.boundingBox())!;
                const pills = await getPillBoxes(group);
                const across = box.y + box.height / 2;

                // the first item is laid out at the trailing edge now, so it claims the padding there
                expect(pills[0].x).toBeGreaterThan(pills[pills.length - 1].x);
                expect(await getOwnerAt(page, box.x + box.width - 1, across)).toEqual({ tag: 'button', index: 0 });
                expect(await getOwnerAt(page, box.x + 1, across)).toEqual({
                    tag: 'button',
                    index: pills.length - 1
                });
            });
        });
    });

    test.describe('E2eButtonToggleStatesStretched', () => {
        const getComponent = (page: Page) => page.getByTestId('e2eButtonToggleStatesStretched');
        const togglePrefix = (locator: Locator) => locator.getByTestId('e2eShowPrefixIcon').click();
        const toggleSuffix = (locator: Locator) => locator.getByTestId('e2eShowSuffixIcon').click();
        const getScreenshotTarget = (locator: Locator) => locator.getByTestId('e2eScreenshotTarget');

        test('with title, prefix and suffix', async ({ page }) => {
            await page.goto('/E2eButtonToggleStatesStretched');
            const locator = getComponent(page);

            await togglePrefix(locator);
            await toggleSuffix(locator);

            await expect(getScreenshotTarget(locator)).toHaveScreenshot('04-light.png');
            await e2eEnableDarkTheme(page);
            await expect(getScreenshotTarget(locator)).toHaveScreenshot('04-dark.png');
        });

        /**
         * The offsets the hit area is built from are the group's own `gap` and `padding`, which this
         * variant does not change — but it is the only one where the pills are sized by `flex: 1`
         * rather than by their content, so it is the only one where a gutter could come out of a
         * division rather than out of the tokens.
         */
        test('hands the gap over at its midline and reaches into the padding', async ({ page }) => {
            await page.goto('/E2eButtonToggleStatesStretched');

            const group = getScreenshotTarget(getComponent(page))
                .locator('kbq-button-toggle-group')
                .nth(states.indexOf('normal'));

            await group.scrollIntoViewIfNeeded();

            const box = (await group.boundingBox())!;
            const pills = await getPillBoxes(group);
            const [first, second] = pills;
            const gapMid = (first.x + first.width + second.x) / 2;
            const across = first.y + first.height / 2;

            expect(await getOwnerAt(page, gapMid - 1, across)).toEqual({ tag: 'button', index: 0 });
            expect(await getOwnerAt(page, gapMid + 1, across)).toEqual({ tag: 'button', index: 1 });

            expect(await getOwnerAt(page, box.x + 1, across)).toEqual({ tag: 'button', index: 0 });
            expect(await getOwnerAt(page, box.x + box.width - 1, across)).toEqual({
                tag: 'button',
                index: pills.length - 1
            });
        });
    });
});
