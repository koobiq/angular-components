import { expect, Locator, Page, test } from '@playwright/test';
import { e2eEnableDarkTheme } from '../../e2e/utils';

test.describe('KbqButtonModule', () => {
    test.describe('E2eButtonStateAndStyle', () => {
        const getComponent = (page: Page) => page.getByTestId('e2eButtonStateAndStyle');
        const togglePrefix = (locator: Locator) => locator.getByTestId('e2eShowPrefixIcon').click();
        const toggleTitle = (locator: Locator) => locator.getByTestId('e2eShowTitle').click();
        const toggleSuffix = (locator: Locator) => locator.getByTestId('e2eShowSuffixIcon').click();
        const getScreenshotTarget = (locator: Locator) => locator.getByTestId('e2eScreenshotTarget');

        test('with title', async ({ page }) => {
            await page.goto('/E2eButtonStateAndStyle');
            const locator = getComponent(page);

            await expect(getScreenshotTarget(locator)).toHaveScreenshot('01-light.png');
            await e2eEnableDarkTheme(page);
            await expect(getScreenshotTarget(locator)).toHaveScreenshot('01-dark.png');
        });

        test('with icon', async ({ page }) => {
            await page.goto('/E2eButtonStateAndStyle');
            const locator = getComponent(page);

            await togglePrefix(locator);
            await toggleTitle(locator);

            await expect(getScreenshotTarget(locator)).toHaveScreenshot('02-light.png');
            await e2eEnableDarkTheme(page);
            await expect(getScreenshotTarget(locator)).toHaveScreenshot('02-dark.png');
        });

        test('with title, prefix and suffix', async ({ page }) => {
            await page.goto('/E2eButtonStateAndStyle');
            const locator = getComponent(page);

            await togglePrefix(locator);
            await toggleSuffix(locator);

            await expect(getScreenshotTarget(locator)).toHaveScreenshot('03-light.png');
            await e2eEnableDarkTheme(page);
            await expect(getScreenshotTarget(locator)).toHaveScreenshot('03-dark.png');
        });

        test('with title in RTL', async ({ page }) => {
            await page.goto('/E2eButtonStateAndStyle');
            const locator = getComponent(page);

            await togglePrefix(locator);
            await toggleSuffix(locator);
            await page.evaluate(() => document.documentElement.setAttribute('dir', 'rtl'));

            await expect(getScreenshotTarget(locator)).toHaveScreenshot('05-rtl.png');
        });
    });

    test.describe('E2eButtonGroup', () => {
        const getComponent = (page: Page) => page.getByTestId('e2eButtonGroup');
        const getScreenshotTarget = (locator: Locator) => locator.getByTestId('e2eScreenshotTarget');

        test('default states', async ({ page }) => {
            await page.goto('/E2eButtonGroup');
            const locator = getComponent(page);

            await expect(getScreenshotTarget(locator)).toHaveScreenshot('04-light.png');
            await e2eEnableDarkTheme(page);
            await expect(getScreenshotTarget(locator)).toHaveScreenshot('04-dark.png');
        });

        test('in RTL', async ({ page }) => {
            await page.goto('/E2eButtonGroup');
            const locator = getComponent(page);

            await page.evaluate(() => document.documentElement.setAttribute('dir', 'rtl'));

            await expect(getScreenshotTarget(locator)).toHaveScreenshot('06-rtl.png');
        });
    });

    test.describe('E2eButtonTruncation', () => {
        const getText = (button: Locator) => button.locator('.kbq-button-text');

        /** Width the label would need if nothing clipped it, versus the width it actually got. */
        const getTextWidths = (button: Locator) =>
            getText(button).evaluate((element) => ({
                scroll: element.scrollWidth,
                client: element.clientWidth
            }));

        /** Distance between the icon's centre and the button's centre on the vertical axis. */
        const getVerticalOffset = async (button: Locator, icon: Locator) => {
            const buttonBox = (await button.boundingBox())!;
            const iconBox = (await icon.boundingBox())!;

            return Math.abs(iconBox.y + iconBox.height / 2 - (buttonBox.y + buttonBox.height / 2));
        };

        test('clamps a hug-width button to its container instead of overflowing it', async ({ page }) => {
            await page.goto('/E2eButtonTruncation');

            // The container is 150px and the button carries no width of its own — `max-width: 100%`
            // on the host is the only thing keeping it in. Without it the button grows to its label.
            const box = (await page.getByTestId('e2eButtonTruncationHug').boundingBox())!;

            expect(box.width).toBeLessThanOrEqual(150);
        });

        for (const testId of ['e2eButtonTruncationHug', 'e2eButtonTruncationFixed', 'e2eButtonTruncationFill']) {
            test(`clips the label of ${testId}`, async ({ page }) => {
                await page.goto('/E2eButtonTruncation');

                const widths = await getTextWidths(page.getByTestId(testId));

                expect(widths.scroll).toBeGreaterThan(widths.client);
            });
        }

        test('keeps the label a block container so the ellipsis is painted', async ({ page }) => {
            await page.goto('/E2eButtonTruncation');

            // `text-overflow: ellipsis` is not painted on a flex box, so this must never be `flex`.
            await expect(getText(page.getByTestId('e2eButtonTruncationHug'))).toHaveCSS('display', 'block');
            await expect(getText(page.getByTestId('e2eButtonTruncationSlots'))).toHaveCSS('display', 'block');
        });

        test('does not stretch a short label', async ({ page }) => {
            await page.goto('/E2eButtonTruncation');

            const box = (await page.getByTestId('e2eButtonTruncationShort').boundingBox())!;

            // The container is 260px wide; the button must still hug its two-character label.
            expect(box.width).toBeLessThan(100);
        });

        test('keeps slot icons at full size while the label is clipped', async ({ page }) => {
            await page.goto('/E2eButtonTruncation');

            const button = page.getByTestId('e2eButtonTruncationSlots');
            const prefix = (await button.locator('.kbq-button-prefix').boundingBox())!;
            const suffix = (await button.locator('.kbq-button-suffix').boundingBox())!;
            const widths = await getTextWidths(button);

            // Only `.kbq-button-text` carries `min-width: 0`, so the icons must not absorb the shrink.
            expect(prefix.width).toBeCloseTo(16, 0);
            expect(suffix.width).toBeCloseTo(16, 0);
            expect(widths.scroll).toBeGreaterThan(widths.client);
        });

        const iconPlacements = [
            { name: 'prefix slot', testId: 'e2eButtonTruncationSlots', icon: '.kbq-button-prefix' },
            { name: 'suffix slot', testId: 'e2eButtonTruncationSlots', icon: '.kbq-button-suffix' },
            { name: 'legacy default slot', testId: 'e2eButtonTruncationLegacy', icon: '.kbq-icon' },
            { name: 'icon-only button', testId: 'e2eButtonTruncationIconOnly', icon: '.kbq-icon' }
        ];

        for (const placement of iconPlacements) {
            test(`centres the icon vertically in the ${placement.name}`, async ({ page }) => {
                await page.goto('/E2eButtonTruncation');

                const button = page.getByTestId(placement.testId);

                // `vertical-align: middle` aligns to the x-height rather than the line box centre and
                // leaves the icon ~1px low, so a default-slot icon needs a flex context to sit true.
                expect(await getVerticalOffset(button, button.locator(placement.icon).first())).toBeLessThanOrEqual(
                    0.5
                );
            });
        }

        test('shows the full label in a tooltip once it is clipped', async ({ page }) => {
            await page.goto('/E2eButtonTruncation');

            await page.getByTestId('e2eButtonTruncationTitle').hover();

            await expect(page.locator('.kbq-tooltip')).toBeVisible();
        });

        test('renders the ellipsis', async ({ page }) => {
            await page.goto('/E2eButtonTruncation');

            // Geometry is identical whether or not the ellipsis is painted, so the glyph itself can
            // only be verified visually.
            const screenshotTarget = page.getByTestId('e2eButtonTruncation').getByTestId('e2eScreenshotTarget');

            await expect(screenshotTarget).toHaveScreenshot('05-light.png');
            await e2eEnableDarkTheme(page);
            await expect(screenshotTarget).toHaveScreenshot('05-dark.png');
        });
    });

    test.describe('E2eButtonStress', () => {
        test('renders a large batch of icon buttons without overflowing the stack', async ({ page }) => {
            const pageErrors: Error[] = [];

            // The original bug threw "Maximum call stack size exceeded" from the styler's
            // MutationObserver feedback loop; capture any uncaught error to assert it does not recur.
            page.on('pageerror', (error) => pageErrors.push(error));

            await page.goto('/E2eButtonStress');

            // Render the default batch (1500 icon buttons).
            await page.getByTestId('e2eButtonStressRun').click();

            const buttons = page.getByTestId('e2eButtonStressTarget').locator('[kbq-button]');

            // The whole batch renders...
            await expect(buttons).toHaveCount(1500);

            // ...and the styler ran for the last button too (it used to be left unstyled).
            await expect(buttons.last()).toHaveClass(/kbq-button-icon/);

            expect(pageErrors).toEqual([]);
        });
    });
});
