import { expect, Locator, Page, test } from '@playwright/test';
import { e2eEnableDarkTheme } from '../../e2e/utils';

test.describe('KbqButtonToggleModule', () => {
    /**
     * A toggle projects its content through its own wrapper element, so the icon is never a direct
     * child of the button's label box and no selector can single it out — the wrapper has to lay the
     * icon out itself, in a flex box, or `vertical-align: middle` aligns it to the x-height and
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

    /**
     * The gap as it is painted, not as it is declared: a block container renders the single space a
     * template leaves around a projected label right next to the icon, on top of the icon's own
     * margin. Asserting the margin alone would not notice the gap doubling.
     */
    const expectIconsSpacedFromLabel = async (toggle: Locator) => {
        const gaps = await toggle.evaluate((element) => {
            const wrapper = element.querySelector('.kbq-button-toggle-wrapper')!;
            const nodes = Array.from(wrapper.childNodes).filter((node) => node.nodeType !== Node.COMMENT_NODE);
            const label = nodes.find((node) => node.nodeType === Node.TEXT_NODE)!;
            const [leading, trailing] = nodes.filter((node) => node.nodeType === Node.ELEMENT_NODE) as HTMLElement[];
            const text = label.textContent!;

            // measure the label by its glyphs: its own edge whitespace is exactly what must not count
            // towards the gap
            const range = document.createRange();

            range.setStart(label, text.length - text.trimStart().length);
            range.setEnd(label, text.trimEnd().length);

            const labelBox = range.getBoundingClientRect();

            return {
                left: labelBox.left - leading.getBoundingClientRect().right,
                right: trailing.getBoundingClientRect().left - labelBox.right,
                expected: parseFloat(
                    getComputedStyle(wrapper).getPropertyValue('--kbq-button-toggle-size-item-content-gap-horizontal')
                )
            };
        });

        expect(gaps.left).toBeCloseTo(gaps.expected, 1);
        expect(gaps.right).toBeCloseTo(gaps.expected, 1);
    };

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

            // beside a label is the case this variant makes hard: it is the only one that lays its
            // content out as a block, which is exactly what an icon has to opt back out of
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
            const icons = toggle.locator('.kbq-icon');

            // the spacing comes from the icons, because only the component knows which side the
            // label is on — text nodes are invisible to CSS
            await expect(icons.first()).toHaveClass(/kbq-icon_left/);
            await expect(icons.nth(1)).toHaveClass(/kbq-icon_right/);

            await expectIconsSpacedFromLabel(toggle);
        });

        test('keeps a label-only toggle in a box that can paint an ellipsis', async ({ page }) => {
            await page.goto('/E2eButtonToggleStatesStretched');
            const locator = getComponent(page);
            const wrapper = getScreenshotTarget(locator).locator('.kbq-button-toggle-wrapper').first();

            // `text-overflow: ellipsis` is declared on the wrapper and is only painted while it is a
            // block container — a flex box would clip the label with no ellipsis at all
            await expect(wrapper).toHaveCSS('display', 'block');

            await togglePrefix(locator);

            // an icon gives that up: a block container would paint the template's whitespace beside
            // it on top of its margin, and leave it off the centre of the line box
            await expect(wrapper).toHaveCSS('display', 'flex');
        });
    });
});
