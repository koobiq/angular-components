import { expect, Locator, Page, test } from '@playwright/test';
import { e2eEnableDarkTheme, e2eForceAutofill } from '../../e2e/utils';

test.describe('KbqInputModule', () => {
    test.describe('E2eInputStateAndStyle', () => {
        const getComponent = (page: Page) => page.getByTestId('e2eInputStateAndStyle');

        test.describe('KbqInput', () => {
            const getTestTable = (locator: Locator) => locator.getByTestId('e2eInputTable');

            test('states', async ({ page }) => {
                await page.goto('/E2eInputStateAndStyle');
                const locator = getComponent(page);
                const screenshotTarget = getTestTable(locator);

                await expect(screenshotTarget).toHaveScreenshot('01-light.png');
                await e2eEnableDarkTheme(page);
                await expect(screenshotTarget).toHaveScreenshot('01-dark.png');
            });
        });

        /**
         * The grid rows above fake autofill with `kbq-form-field_autofilled`, the class
         * `AutofillMonitor` adds — which is only half the implementation. These assert the other half:
         * the `:has(:is(…):is(:autofill, :-webkit-autofill))` arm that paints the tint in the same style
         * pass the browser fills the value, without waiting for change detection.
         *
         * Colours are compared against the same cell before forcing rather than hardcoded, so the tests
         * survive a token change and only fail when the *relationship* between states breaks.
         */
        test.describe('autofill', () => {
            // Cells are named after their state. Two rows are plain `default`; both selectors below
            // resolve in document order, so they consistently address the first of them.
            const cellSelector = (state: string) => `[data-testid="e2eInputCell_${state}"]`;

            /** `rgb(…)` has no alpha channel and is fully opaque; `rgba(…)` carries it as the 4th part. */
            const alphaOf = (colour: string): number => {
                const parts = colour.match(/rgba?\(([^)]+)\)/)?.[1].split(',') ?? [];

                return parts.length === 4 ? Number(parts[3]) : 1;
            };

            const readStyles = (page: Page, state: string) =>
                page.evaluate((selector) => {
                    const cell = document.querySelector(selector)!;
                    const control = cell.querySelector('.kbq-input')!;
                    const container = cell.querySelector('.kbq-form-field__container')!;

                    return {
                        containerBackground: getComputedStyle(container).backgroundColor,
                        controlBackground: getComputedStyle(control).backgroundColor,
                        controlBoxShadow: getComputedStyle(control).boxShadow,
                        controlTextFill: getComputedStyle(control).webkitTextFillColor
                    };
                }, cellSelector(state));

            const forceAutofill = (page: Page, context: Parameters<typeof e2eForceAutofill>[1], state: string) =>
                e2eForceAutofill(page, context, `${cellSelector(state)} .kbq-input`);

            test('tints the field through the real pseudo-class, not only through the class', async ({
                page,
                context
            }) => {
                await page.goto('/E2eInputStateAndStyle');

                const before = await readStyles(page, 'default');

                await forceAutofill(page, context, 'default');

                const after = await readStyles(page, 'default');

                expect(after.containerBackground).not.toBe(before.containerBackground);
                // The faked row must land on exactly the same tint as the forced pseudo-class.
                expect(after.containerBackground).toBe((await readStyles(page, 'autofill')).containerBackground);
            });

            test('holds the browser background at zero alpha and paints nothing on the control', async ({
                page,
                context
            }) => {
                await page.goto('/E2eInputStateAndStyle');
                await forceAutofill(page, context, 'default');

                const { controlBackground, controlBoxShadow } = await readStyles(page, 'default');

                // Chrome applies its own autofill background the moment the pseudo-class matches, and no
                // author declaration can outrank it. The huge `transition-duration` parks the used value
                // at alpha 0, so it never paints: the colour channels stay Chrome's (232, 240, 254) and
                // only the alpha matters. Delete the suppression and this reads 1.
                expect(alphaOf(controlBackground)).toBe(0);

                // And nothing of ours paints over it either: the tint tokens are translucent, so painting
                // the control in the same colour would stack it on top of the container's and make the
                // control visibly darker than the padding around it (#DS-4096).
                expect(controlBoxShadow).toBe('none');
            });

            test('loses to the error state', async ({ page, context }) => {
                await page.goto('/E2eInputStateAndStyle');

                const before = await readStyles(page, 'error');

                await forceAutofill(page, context, 'error');

                const after = await readStyles(page, 'error');

                expect(after.containerBackground).toBe(before.containerBackground);
                expect(after.controlTextFill).toBe(before.controlTextFill);
            });

            test('loses to the disabled state', async ({ page, context }) => {
                await page.goto('/E2eInputStateAndStyle');

                const before = await readStyles(page, 'disabled');

                await forceAutofill(page, context, 'disabled');

                const after = await readStyles(page, 'disabled');

                expect(after.containerBackground).toBe(before.containerBackground);
                expect(after.controlTextFill).toBe(before.controlTextFill);
            });
        });

        test.describe('KbqInputPassword', () => {
            const getTestTable = (locator: Locator) => locator.getByTestId('e2eInputPasswordTable');
            const getInputPasswordTestRow = (locator: Locator) => locator.getByTestId('e2eInputPasswordWithHints');

            test('states', async ({ page }) => {
                await page.goto('/E2eInputStateAndStyle');
                const locator = getComponent(page);
                const screenshotTarget = getTestTable(locator);

                await expect(screenshotTarget).toHaveScreenshot('02-light.png');
                await e2eEnableDarkTheme(page);
                await expect(screenshotTarget).toHaveScreenshot('02-dark.png');
            });

            test('hints', async ({ page }) => {
                await page.goto('/E2eInputStateAndStyle');
                const locator = getComponent(page);
                const screenshotTarget = getInputPasswordTestRow(locator);

                await expect(screenshotTarget).toHaveScreenshot('03-light.png');
                await e2eEnableDarkTheme(page);
                await expect(screenshotTarget).toHaveScreenshot('03-dark.png');
            });

            test('text visible', async ({ page }) => {
                await page.goto('/E2eInputStateAndStyle');
                const locator = getComponent(page);
                const screenshotTarget = getInputPasswordTestRow(locator);

                await screenshotTarget.locator('input').focus();
                const toggle = screenshotTarget.locator('kbq-password-toggle');

                await toggle.click();

                await expect(screenshotTarget).toHaveScreenshot('04-light.png');
            });

            test('hints on blur', async ({ page }) => {
                await page.goto('/E2eInputStateAndStyle');
                const locator = getComponent(page);
                const screenshotTarget = getInputPasswordTestRow(locator);
                const inputPassword = screenshotTarget.locator('input');

                await inputPassword.focus();
                await inputPassword.blur();

                await expect(screenshotTarget).toHaveScreenshot('05-light.png');
                await e2eEnableDarkTheme(page);
                await expect(screenshotTarget).toHaveScreenshot('05-dark.png');
            });
        });
    });
});
