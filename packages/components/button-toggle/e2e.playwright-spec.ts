import { expect, Locator, Page, test } from '@playwright/test';
import { e2eEnableDarkTheme } from '../../e2e/utils';

test.describe('KbqButtonToggleModule', () => {
    /** The label box, which is both what paints the ellipsis and what `kbq-title` measures. */
    const getLabel = (toggle: Locator) => toggle.locator('.kbq-button-toggle-text');

    /**
     * A toggle projects its content through its own elements, so an icon is never a direct child of
     * the button's label box and no selector can single it out — the box that holds the icon has to
     * lay it out itself, in a flex context, or `vertical-align: middle` aligns it to the x-height and
     * leaves it ~1px below the centre. Asserted here rather than left to the baselines, because a
     * ~1px drift reads as noise in a diff image.
     */
    const expectIconsCentred = async (locator: Locator) => {
        const icons = locator.getByTestId('e2eScreenshotTarget').locator('.kbq-icon');

        for (let index = 0; index < (await icons.count()); index++) {
            const icon = icons.nth(index);
            const button = icon.locator('xpath=ancestor::button[1]');
            const iconBox = (await icon.boundingBox())!;
            const buttonBox = (await button.boundingBox())!;

            expect(Math.abs(iconBox.y + iconBox.height / 2 - (buttonBox.y + buttonBox.height / 2))).toBeLessThanOrEqual(
                0.5
            );
        }
    };

    /** The gap between the icons and the label box, as laid out. */
    const expectIconsSpacedFromLabel = async (toggle: Locator) => {
        const gaps = await toggle.evaluate((element) => {
            const wrapper = element.querySelector('.kbq-button-toggle-wrapper')!;
            const label = element.querySelector('.kbq-button-toggle-text')!;
            const [leading, trailing] = Array.from(wrapper.children).filter(
                (child) => child !== label
            ) as HTMLElement[];
            const box = label.getBoundingClientRect();

            return {
                left: box.left - leading.getBoundingClientRect().right,
                right: trailing.getBoundingClientRect().left - box.right,
                expected: parseFloat(
                    getComputedStyle(wrapper).getPropertyValue('--kbq-button-toggle-size-item-content-gap-horizontal')
                )
            };
        });

        expect(gaps.left).toBeCloseTo(gaps.expected, 1);
        expect(gaps.right).toBeCloseTo(gaps.expected, 1);
    };

    /**
     * The gap as it is painted, not as it is declared: the label box is measured by its glyphs as well
     * as by its border box, and the two must agree. A block container trims the single space a template
     * leaves around a projected label at both line edges — if the box ever grew past its glyphs, the
     * gap would silently widen by a space without any margin changing. Only meaningful while the label
     * fits: a range's rects ignore `overflow: hidden`, so a clipped label measures past its own box.
     */
    const expectLabelBoxHugsGlyphs = async (toggle: Locator) => {
        const slack = await toggle.evaluate((element) => {
            const label = element.querySelector('.kbq-button-toggle-text')!;
            const text = Array.from(label.childNodes).find((node) => node.nodeType === Node.TEXT_NODE)!;
            const value = text.textContent!;
            const range = document.createRange();

            range.setStart(text, value.length - value.trimStart().length);
            range.setEnd(text, value.trimEnd().length);

            const glyphs = range.getBoundingClientRect();
            const box = label.getBoundingClientRect();

            return { leading: glyphs.left - box.left, trailing: box.right - glyphs.right };
        });

        expect(slack.leading).toBeCloseTo(0, 1);
        expect(slack.trailing).toBeCloseTo(0, 1);
    };

    /** Width the label would need if nothing clipped it, versus the width it actually got. */
    const getLabelWidths = (toggle: Locator) =>
        getLabel(toggle).evaluate((element) => ({ scroll: element.scrollWidth, client: element.clientWidth }));

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
            await e2eEnableDarkTheme(page);
            await expect(getScreenshotTarget(locator)).toHaveScreenshot('01-dark.png');
        });

        test('with icon', async ({ page }) => {
            await page.goto('/E2eButtonToggleStates');
            const locator = getComponent(page);

            await togglePrefix(locator);
            await toggleTitle(locator);

            await expect(getScreenshotTarget(locator)).toHaveScreenshot('02-light.png');
            await e2eEnableDarkTheme(page);
            await expect(getScreenshotTarget(locator)).toHaveScreenshot('02-dark.png');
        });

        /**
         * Every state in the screenshots above is faked with a class — `.kbq-hover`, `.kbq-active`,
         * `.cdk-keyboard-focused` — which the theme aliases to the real pseudo-class. That verifies
         * the class branch and nothing else: the real `:hover` selector, the real tab order and
         * `FocusMonitor` are never exercised by a baseline.
         */
        test('paints the hover state from a real pointer', async ({ page }) => {
            await page.goto('/E2eButtonToggleStates');
            const locator = getComponent(page);
            // the "normal" column carries none of the faked classes
            const button = getScreenshotTarget(locator)
                .locator('kbq-button-toggle-group')
                .first()
                .locator('kbq-button-toggle')
                .last()
                .locator('button');

            const before = await button.evaluate((element) => getComputedStyle(element).backgroundColor);

            await button.hover();

            const after = await button.evaluate((element) => getComputedStyle(element).backgroundColor);

            expect(after).not.toBe(before);
        });

        test('reaches the group with Tab and walks it with the arrow keys', async ({ page }) => {
            await page.goto('/E2eButtonToggleStates');
            const locator = getComponent(page);
            const group = getScreenshotTarget(locator).locator('kbq-button-toggle-group').first();

            await locator.getByTestId('e2eShowSuffixIcon').locator('input').focus();
            await page.keyboard.press('Tab');

            // a radio group is a single tab stop, and only a keyboard origin paints the ring
            const focused = group.locator('kbq-button-toggle.cdk-keyboard-focused');

            await expect(focused).toHaveCount(1);
            await expect(focused.locator('button')).toBeFocused();

            await page.keyboard.press('ArrowRight');

            // the arrows move focus and selection together, as a radiogroup is expected to
            const selected = group.locator('button[aria-checked="true"]');

            await expect(selected).toHaveCount(1);
            await expect(selected).toBeFocused();
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

        test('centres icons vertically in an icon-only toggle', async ({ page }) => {
            await page.goto('/E2eButtonToggleStates');
            const locator = getComponent(page);

            await togglePrefix(locator);
            await toggleTitle(locator);

            await expectIconsCentred(locator);
        });

        test.describe('hit area', () => {
            /**
             * One column of one orientation, `role` telling the exclusive rows from the `multiple` ones
             * and the first item's `aria-label` naming the state the column renders — `normal` is the
             * only one whose items carry neither a faked state class nor `disabled`. `iconOnly` drops
             * that first item's label, which is what makes `KbqButtonCssStyler` swap its class over to
             * `.kbq-button-icon`; `default 2`/`default 3` keep their labels either way. Scrolled into
             * view because `elementFromPoint` answers `null` outside the viewport, and this harness lays
             * every state of every orientation out in one oversized table.
             */
            const openGroup = async (page: Page, { vertical = false, state = 'normal', iconOnly = false } = {}) => {
                await page.goto('/E2eButtonToggleStates');

                const locator = getComponent(page);

                if (iconOnly) {
                    await togglePrefix(locator);
                    await toggleTitle(locator);
                }

                const group = getScreenshotTarget(locator)
                    .locator(
                        `kbq-button-toggle-group[role="radiogroup"][aria-orientation="${
                            vertical ? 'vertical' : 'horizontal'
                        }"]`
                    )
                    .filter({ has: page.locator(`button[aria-label="${state}"]`) });

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
                await expect(buttons.nth(0)).toHaveAttribute('aria-checked', 'false');
                await expect(buttons.nth(1)).toHaveAttribute('aria-checked', 'false');
            });

            test('claims the same gutters for an icon-only item', async ({ page }) => {
                const group = await openGroup(page, { iconOnly: true });
                const box = (await group.boundingBox())!;
                const [first, second] = await getPillBoxes(group);
                const across = first.y + first.height / 2;

                // An item with nothing but an icon in it, which lays its content out differently and
                // is the narrowest pill a group can hand a gutter to. It stays a `.kbq-button`: the
                // second class the hit-area selectors name, `.kbq-button-icon`, is unreachable inside
                // a toggle, because the icon is projected through the toggle's own wrapper and so is
                // never content of the button `KbqButtonCssStyler` counts. `.kbq-button_no-label` is
                // what marks the case here.
                await expect(group.locator('kbq-button-toggle').first().locator('button')).toHaveClass(
                    /kbq-button_no-label/
                );

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

                await expect(second).toHaveAttribute('aria-checked', 'false');

                await page.mouse.click((first.x + first.width + secondBox.x) / 2 + 1, first.y + first.height / 2);

                await expect(second).toHaveAttribute('aria-checked', 'true');
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
        const toggleTitle = (locator: Locator) => locator.getByTestId('e2eShowTitle').click();
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
                .filter({ has: page.locator('button[aria-label="normal"]') });

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

        test('centres icons vertically', async ({ page }) => {
            await page.goto('/E2eButtonToggleStatesStretched');
            const locator = getComponent(page);

            // beside a label is the case this variant makes hard: it is the only one wide enough to
            // clip its label, so it is the only one that has to keep the label box a block container
            await togglePrefix(locator);
            await toggleSuffix(locator);

            await expectIconsCentred(locator);

            await toggleTitle(locator);

            await expectIconsCentred(locator);
        });

        test('spaces the icons from the label', async ({ page }) => {
            await page.goto('/E2eButtonToggleStatesStretched');
            const locator = getComponent(page);

            await togglePrefix(locator);
            await toggleSuffix(locator);

            const toggle = getScreenshotTarget(locator).locator('kbq-button-toggle').first();

            // the spacing is the row's `gap`, which only reaches the icons while they are laid out
            // beside the label box rather than inside it
            await expect(getLabel(toggle).locator('.kbq-icon')).toHaveCount(0);
            await expect(toggle.locator('.kbq-button-toggle-wrapper > .kbq-icon')).toHaveCount(2);

            await expectIconsSpacedFromLabel(toggle);
            await expectLabelBoxHugsGlyphs(toggle);
        });

        test('keeps the label a block container so the ellipsis is painted', async ({ page }) => {
            await page.goto('/E2eButtonToggleStatesStretched');
            const locator = getComponent(page);
            const label = getLabel(getScreenshotTarget(locator).locator('kbq-button-toggle').first());

            // `text-overflow: ellipsis` is not painted on a flex box, so this must never be `flex`.
            // The CSS specifies `block`, which is also what a flex item computes to anyway.
            await expect(label).toHaveCSS('display', 'block');

            // and an icon in a marker slot must not take that away: it is laid out beside the label
            // box, so the box is free to stay a block container
            await togglePrefix(locator);

            await expect(label).toHaveCSS('display', 'block');
        });
    });

    test.describe('E2eButtonToggleTruncation', () => {
        const getScreenshotTarget = (page: Page) =>
            page.getByTestId('e2eButtonToggleTruncation').getByTestId('e2eScreenshotTarget');

        for (const testId of [
            'e2eButtonToggleTruncationSlots',
            'e2eButtonToggleTruncationWrappedLabel',
            'e2eButtonToggleTruncationLabelOnly'
        ]) {
            test(`truncates the label of ${testId} with an ellipsis`, async ({ page }) => {
                await page.goto('/E2eButtonToggleTruncation');
                const toggle = page.getByTestId(testId);

                await expect(getLabel(toggle)).toHaveCSS('display', 'block');
                await expect(getLabel(toggle)).toHaveCSS('text-overflow', 'ellipsis');

                const widths = await getLabelWidths(toggle);

                expect(widths.scroll).toBeGreaterThan(widths.client);
            });
        }

        test('keeps slotted icons at full size while the label shrinks', async ({ page }) => {
            await page.goto('/E2eButtonToggleTruncation');
            const toggle = page.getByTestId('e2eButtonToggleTruncationSlots');
            const icons = toggle.locator('.kbq-button-toggle-wrapper > .kbq-icon');

            // `min-width: 0` is on the label box alone, so it is the only flex item that absorbs the
            // shrink — an icon that shrank with it would be clipped instead of the label
            for (let index = 0; index < (await icons.count()); index++) {
                expect((await icons.nth(index).boundingBox())!.width).toBeGreaterThan(15);
            }

            await expectIconsSpacedFromLabel(toggle);
        });

        test('centres a slotted icon with no label beside it', async ({ page }) => {
            await page.goto('/E2eButtonToggleTruncation');
            const toggle = page.getByTestId('e2eButtonToggleTruncationIconOnly');
            const button = toggle.locator('button');
            const buttonBox = (await button.boundingBox())!;
            const iconBox = (await toggle.locator('.kbq-icon').boundingBox())!;

            // the label box is empty here, and an empty box would still take a gap of the row and
            // push the icon off centre — hence the `:empty` guard
            await expect(getLabel(toggle)).toHaveCSS('display', 'none');
            expect(Math.abs(iconBox.x + iconBox.width / 2 - (buttonBox.x + buttonBox.width / 2))).toBeLessThanOrEqual(
                0.5
            );
        });

        test('gives an icon left in the default slot a flex context instead of an ellipsis', async ({ page }) => {
            await page.goto('/E2eButtonToggleTruncation');
            const toggle = page.getByTestId('e2eButtonToggleTruncationLegacy');

            // legacy markup shares one box with the label, and only a flex context centres the icon
            // exactly — the documented trade-off `kbqButtonPrefix`/`kbqButtonSuffix` exist to avoid
            await expect(getLabel(toggle).locator('.kbq-icon')).toHaveCount(1);
            await expect(getLabel(toggle)).toHaveCSS('display', 'flex');
        });

        test('opens the tooltip at the width the label starts clipping at', async ({ page }) => {
            await page.goto('/E2eButtonToggleTruncation');

            // `kbq-title` measures the label box against itself, so there is no band where the label
            // is already clipped but the tooltip stays silent — which is what measuring it against
            // the whole button would produce, as wide as an icon plus its gap
            for (const testId of ['e2eButtonToggleTruncationSlots', 'e2eButtonToggleTruncationLabelOnly']) {
                const toggle = page.getByTestId(testId);

                await toggle.hover();

                await expect(page.locator('.kbq-tooltip')).toBeVisible();
                await expect(page.locator('.kbq-tooltip')).toHaveText(/Длинный текст/);

                await page.mouse.move(0, 0);
                await expect(page.locator('.kbq-tooltip')).toBeHidden();
            }
        });

        test('does not open the tooltip while the label fits', async ({ page }) => {
            await page.goto('/E2eButtonToggleTruncation');
            const toggle = page.getByTestId('e2eButtonToggleTruncationIconOnly');

            await toggle.hover();

            await expect(page.locator('.kbq-tooltip')).toBeHidden();
        });

        test('renders the ellipsis', async ({ page }) => {
            await page.goto('/E2eButtonToggleTruncation');

            // Geometry is identical whether or not the ellipsis is painted, so the glyph itself can
            // only be verified visually.
            await expect(getScreenshotTarget(page)).toHaveScreenshot('05-light.png');
            await e2eEnableDarkTheme(page);
            await expect(getScreenshotTarget(page)).toHaveScreenshot('05-dark.png');
        });
    });
});
