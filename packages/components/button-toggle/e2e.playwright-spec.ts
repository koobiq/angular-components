import { expect, Locator, Page, test } from '@playwright/test';
import { e2eEnableDarkTheme } from '../../e2e/utils';

test.describe('KbqButtonToggleModule', () => {
    /**
     * A toggle projects its content through its own wrapper element, so the icon is never a direct
     * child of the button's label box and no selector can single it out. Only an icon-only toggle is
     * covered: the text variants keep a block container so their label still truncates with an
     * ellipsis, which leaves their icon on a line box. Asserted here rather than left to the
     * baselines, because a ~1px drift reads as noise in a diff image.
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

        test('centres icons vertically in an icon-only toggle', async ({ page }) => {
            await page.goto('/E2eButtonToggleStatesStretched');
            const locator = getComponent(page);

            // the stretched variant makes the wrapper a block container so the label can truncate,
            // which is exactly what an icon-only toggle has to opt back out of
            await togglePrefix(locator);
            await toggleTitle(locator);

            await expectIconsCentred(locator);
        });

        test('spaces the icons from the label', async ({ page }) => {
            await page.goto('/E2eButtonToggleStatesStretched');
            const locator = getComponent(page);

            await togglePrefix(locator);
            await toggleSuffix(locator);

            const icons = locator.getByTestId('e2eScreenshotTarget').locator('.kbq-icon');
            const leading = icons.first();
            const trailing = icons.nth(1);

            // `gap` is inert on the block container this variant needs for its ellipsis, so the
            // spacing comes from the icons — and only the component knows which side the label is on
            await expect(leading).toHaveClass(/kbq-icon_left/);
            await expect(trailing).toHaveClass(/kbq-icon_right/);

            const margin = (locator: Locator, side: 'marginLeft' | 'marginRight') =>
                locator.evaluate((element, property) => parseFloat(getComputedStyle(element)[property]), side);

            expect(await margin(leading, 'marginRight')).toBeGreaterThan(0);
            expect(await margin(trailing, 'marginLeft')).toBeGreaterThan(0);
        });

        test('keeps the label in a box that can paint an ellipsis', async ({ page }) => {
            await page.goto('/E2eButtonToggleStatesStretched');

            const wrapper = getComponent(page).getByTestId('e2eScreenshotTarget').locator('.kbq-button-toggle-wrapper');

            // `text-overflow: ellipsis` is declared on the wrapper and is only painted while it is a
            // block container — a flex box would clip the label with no ellipsis at all
            await expect(wrapper.first()).toHaveCSS('display', 'block');
        });
    });
});
