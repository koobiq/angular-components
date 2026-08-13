import { expect, Locator, Page, test } from '@playwright/test';
import { e2eEnableDarkTheme, e2eForceAutofillAll } from '../../e2e/utils';

test.describe('KbqFormFieldModule', () => {
    test.describe('E2eFormFieldAddons', () => {
        test.beforeEach(async ({ page }) => page.goto('/E2eFormFieldAddons'));

        test('cleaner owns pointer and keyboard clearing', async ({ page }) => {
            const input = page.getByTestId('cleanerInput');

            await input.focus();
            await input.press('Escape');
            await expect(input).toHaveValue('');

            await input.fill('Koobiq');
            await page.getByTestId('cleaner').focus();
            await page.getByTestId('cleaner').press('Space');
            await expect(input).toHaveValue('');
            await expect(input).toBeFocused();
        });

        test('password toggle owns Alt+F8', async ({ page }) => {
            const input = page.getByTestId('passwordInput');

            await expect(input).toHaveAttribute('type', 'password');
            await input.press('Alt+F8');
            await expect(input).toHaveAttribute('type', 'text');
        });

        test('stepper connects when projected dynamically', async ({ page }) => {
            const input = page.getByTestId('numberInput');

            await page.getByTestId('showStepper').click();
            await page.getByTestId('stepper').locator('.kbq-stepper-step-up').click();
            await expect(input).toHaveValue('11');
        });
    });

    test.describe('E2eFormFieldGroup', () => {
        const getComponent = (page: Page) => page.getByTestId('e2eFormFieldGroup');

        test('horizontal', async ({ page }) => {
            const getScreenshotTarget = (locator: Locator) => locator.getByTestId('e2eHorizontalTarget');

            await page.goto('/E2eFormFieldGroup');
            const locator = getComponent(page);

            await expect(getScreenshotTarget(locator)).toHaveScreenshot('01-light.png');
        });

        test('vertical', async ({ page }) => {
            const getScreenshotTarget = (locator: Locator) => locator.getByTestId('e2eVerticalTarget');

            await page.goto('/E2eFormFieldGroup');
            const locator = getComponent(page);

            await expect(getScreenshotTarget(locator)).toHaveScreenshot('02-light.png');
        });
    });

    test.describe('E2eFormFieldset', () => {
        const getComponent = (page: Page) => page.getByTestId('e2eFormFieldset');
        const getScreenshotTarget = (locator: Locator) => locator.getByTestId('e2eScreenshotTarget');

        test('horizontal', async ({ page }) => {
            await page.goto('/E2eFormFieldset');
            const locator = getComponent(page);

            await expect(getScreenshotTarget(locator)).toHaveScreenshot('03-light.png');
        });

        // All height tokens involved are whole CSS pixels, so at a 1x device pixel ratio the
        // form-field's height (sum of independently-rounded border/padding/line-height values) and
        // the button's height (a single token) land on the same integer and a plain boundingBox
        // comparison would pass either way. Fractional device pixel ratios force the browser to snap
        // each side's boxes to physical pixels independently, which is what actually exposes a
        // regression of the merged-border seam.
        for (const deviceScaleFactor of [1.5, 2.5]) {
            test.describe(`at ${deviceScaleFactor}x device scale`, () => {
                test.use({ deviceScaleFactor });

                test('button and form-field stay flush at the shared border seam', async ({ page }) => {
                    await page.goto('/E2eFormFieldset');
                    const locator = getComponent(page);

                    const fieldBox = (await locator.locator('.kbq-form-field__container').boundingBox())!;
                    const buttonBox = (await locator.locator('button.kbq-button').boundingBox())!;

                    expect(fieldBox.height).toBeCloseTo(buttonBox.height, 1);
                    expect(fieldBox.y).toBeCloseTo(buttonBox.y, 1);
                    expect(fieldBox.y + fieldBox.height).toBeCloseTo(buttonBox.y + buttonBox.height, 1);
                });
            });
        }
    });

    test.describe('E2eFormFieldAutofill', () => {
        const getComponent = (page: Page) => page.getByTestId('e2eFormFieldAutofill');
        const getScreenshotTarget = (locator: Locator) => locator.getByTestId('e2eFormFieldAutofillTable');

        /** How many rendered boxes stick out of the screenshot target, and would therefore be cropped. */
        const countOutsideTheTable = (target: Locator): Promise<number> =>
            target.evaluate((table: HTMLElement) => {
                const box = table.getBoundingClientRect();

                return Array.from(table.querySelectorAll('*'))
                    .map((el) => el.getBoundingClientRect())
                    .filter(({ width, height }) => width > 0 && height > 0)
                    .filter(
                        ({ left, top, right, bottom }) =>
                            left < box.left - 0.5 ||
                            top < box.top - 0.5 ||
                            right > box.right + 0.5 ||
                            bottom > box.bottom + 0.5
                    ).length;
            });

        /** `rgb(…)` carries no alpha and is opaque; `rgba(…)` puts it fourth. */
        const controlBackgroundAlpha = (page: Page): Promise<number> =>
            page.evaluate(() => {
                const background = getComputedStyle(document.querySelector('.kbq-input')!).backgroundColor;
                const parts = background.match(/rgba?\(([^)]+)\)/)?.[1].split(',') ?? [];

                return parts.length === 4 ? Number(parts[3]) : 1;
            });

        // The browser paints its own background on an autofilled control and the design system suppresses
        // it with a 600000s `background-color` transition, because a transition is the only thing in the
        // cascade that outranks the UA's `!important`. `animations: 'disabled'` — the project default —
        // calls `finish()` on every animation with a finite end time, and 600000s is finite: the
        // suppression would be fast-forwarded to its end value and every shot below would capture Chrome's
        // own blue instead of the design system's tint. Measured, not guessed. Do not remove.
        const screenshot = { animations: 'allow' } as const;

        const ROWS = 8;
        const CONTROLS_PER_ROW = 5;

        // The selector the stylesheet itself keys on, not one that happens to fit the fixture: the tag
        // input's host class is `kbq-tag-input` alone, and it only carries `kbq-input` here because the
        // fixture writes `kbqInput` next to `kbqTagInputFor`. Drop that attribute and a fixture-shaped
        // selector would silently stop forcing the tag column.
        const CONTROLS = '[data-testid="e2eFormFieldAutofill"] :is(.kbq-input, .kbq-tag-input, .kbq-textarea)';

        test('states', async ({ page }) => {
            await page.goto('/E2eFormFieldAutofill');
            const component = getComponent(page);
            const target = getScreenshotTarget(component);

            // The route is derived from the class name, so a rename yields a blank page and a perfectly
            // stable, perfectly meaningless baseline. And a cell that falls outside the table's box is
            // cropped by the locator without failing, so containment is asserted rather than assumed.
            await expect(component).toBeVisible();
            await expect(target.locator('tbody > tr')).toHaveCount(ROWS);
            await expect(target.locator('tbody > tr > td')).toHaveCount(ROWS * (CONTROLS_PER_ROW + 1));
            expect(await countOutsideTheTable(target)).toBe(0);

            await expect(target).toHaveScreenshot('04-light.png', screenshot);
            await e2eEnableDarkTheme(page);
            await expect(target).toHaveScreenshot('04-dark.png', screenshot);
        });

        test('autofilled states', async ({ page, context }) => {
            await page.goto('/E2eFormFieldAutofill');
            const target = getScreenshotTarget(getComponent(page));

            // Absolute, not a count of the same selector on the other side of CDP — that would only
            // catch zero, and the dangerous number is 39.
            expect(await e2eForceAutofillAll(page, context, CONTROLS)).toBe(ROWS * CONTROLS_PER_ROW);

            await expect(target).toHaveScreenshot('05-light.png', screenshot);
            await e2eEnableDarkTheme(page);
            await expect(target).toHaveScreenshot('05-dark.png', screenshot);

            // Self-check, after the last shot: the suppression is a *running* transition, so if anything
            // ever finishes it — `animations: 'disabled'` above all — this reads 1 and both screenshots
            // above captured Chrome's opaque autofill blue instead of the design system's tint.
            expect(await controlBackgroundAlpha(page)).toBe(0);
        });
    });
});
