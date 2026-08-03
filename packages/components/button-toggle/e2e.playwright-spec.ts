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

        test('centres icons vertically in an icon-only toggle', async ({ page }) => {
            await page.goto('/E2eButtonToggleStates');
            const locator = getComponent(page);

            await togglePrefix(locator);
            await toggleTitle(locator);

            await expectIconsCentred(locator);
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
