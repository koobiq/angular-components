import { expect, Locator, Page, test } from '@playwright/test';
import { e2eEnableDarkTheme } from '../../e2e/utils';

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

        // Assertion-only: typing, stepping, pasting and switching the locale are the behaviours a real
        // browser verifies and jsdom cannot, and none of them needs a screenshot baseline.
        test.describe('KbqNumberInput keyboard', () => {
            const thinSpace = ' ';
            const getControl = (page: Page) => page.getByTestId('e2eInputNumberKeyboardControl');

            test.beforeEach(async ({ page }) => {
                await page.goto('/E2eInputStateAndStyle');
            });

            test('should group the value as it is typed', async ({ page }) => {
                const control = getControl(page);

                await control.click();
                await control.pressSequentially('1234567');

                await expect(control).toHaveValue(`1${thinSpace}234${thinSpace}567`);
            });

            test('should keep the caret next to the typed digit when a separator is inserted', async ({ page }) => {
                const control = getControl(page);

                await control.click();
                await control.pressSequentially('1234');

                // The caret correction compares the reformatted view value against the model the previous
                // keystroke committed, and that commit is deferred to a `setTimeout(0)`. Settle it before
                // typing the digit that inserts the separator: otherwise the comparison is off by the
                // still-pending keystroke, the correction is skipped, and the caret stays before the `5`.
                await expect(control).toHaveValue('1234');

                await control.press('5');

                await expect(control).toHaveValue(`12${thinSpace}345`);
                // Six characters, so the caret sits after the last digit rather than before the separator.
                await expect
                    .poll(() => control.evaluate((element: HTMLInputElement) => element.selectionStart))
                    .toBe(6);
            });

            test('should step by step and bigStep from the keyboard', async ({ page }) => {
                const control = getControl(page);

                await control.click();
                await control.pressSequentially('10');
                await control.press('ArrowUp');

                await expect(control).toHaveValue('10,5');

                await control.press('Shift+ArrowUp');

                await expect(control).toHaveValue('20,5');

                await control.press('ArrowDown');

                await expect(control).toHaveValue('20');
            });

            test('should expose the stepped value through spinbutton semantics', async ({ page }) => {
                const control = getControl(page);

                await expect(control).toHaveAttribute('role', 'spinbutton');
                await expect(control).toHaveAttribute('inputmode', 'decimal');
                await expect(control).toHaveAttribute('aria-valuemin', '-1000000');
                await expect(control).toHaveAttribute('aria-valuemax', '1000000');

                await control.click();
                await control.pressSequentially('12345');

                await expect(control).toHaveAttribute('aria-valuenow', '12345');
                await expect(control).toHaveAttribute('aria-valuetext', `12${thinSpace}345`);
            });
        });
    });
});
