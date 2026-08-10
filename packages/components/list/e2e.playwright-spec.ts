import { expect, Locator, Page, test } from '@playwright/test';
import { e2eEnableDarkTheme } from '../../e2e/utils';

test.describe('KbqListModule', () => {
    test.describe('E2eListStates', () => {
        const getComponent = (page: Page) => page.getByTestId('e2eListStates');
        const getScreenshotTarget = (locator: Locator) => locator.getByTestId('e2eScreenshotTarget');

        test('states', async ({ page }) => {
            await page.goto('/E2eListStates');
            const locator = getComponent(page);

            await expect(getScreenshotTarget(locator)).toHaveScreenshot('01-light.png');
            await e2eEnableDarkTheme(page);
            await expect(getScreenshotTarget(locator)).toHaveScreenshot('01-dark.png');
        });
    });

    test.describe('E2eListSelectionState', () => {
        const getComponent = (page: Page) => page.getByTestId('e2eListSelectionState');

        test('selected disabled option', async ({ page }) => {
            await page.goto('/E2eListSelectionState');
            const component = getComponent(page);

            await expect(component).toHaveScreenshot('02-light.png');
        });
    });

    test.describe('E2eListOptionActionVisibility', () => {
        const getOptionAction = (page: Page, option: string) =>
            page.getByTestId(option).locator('.kbq-action-container');

        test.beforeEach(async ({ page }) => {
            await page.goto('/E2eListOptionActionVisibility');
        });

        test('reveals the action on hover only', async ({ page }) => {
            await expect(getOptionAction(page, 'option-1')).toBeHidden();

            await page.getByTestId('option-1').hover();
            await expect(getOptionAction(page, 'option-1')).toBeVisible();

            await page.mouse.move(0, 0);
            await expect(getOptionAction(page, 'option-1')).toBeHidden();
        });

        test('hides the action of a mouse-focused option once the pointer leaves', async ({ page }) => {
            await page.getByTestId('option-1').click();
            await page.mouse.move(0, 0);

            // The option keeps `kbq-focused` (it is `tabindex="-1"` and a click focuses it), but the
            // action must not stay behind — the reveal is gated on `cdk-keyboard-focused`.
            await expect(page.getByTestId('option-1')).toHaveClass(/kbq-focused/);
            await expect(page.getByTestId('e2eList')).not.toHaveClass(/cdk-keyboard-focused/);
            await expect(getOptionAction(page, 'option-1')).toBeHidden();
        });

        test('shows the action of exactly one option at a time', async ({ page }) => {
            await page.getByTestId('option-1').click();
            await page.getByTestId('option-2').hover();

            await expect(getOptionAction(page, 'option-2')).toBeVisible();
            await expect(getOptionAction(page, 'option-1')).toBeHidden();
        });

        test('reveals the action of the keyboard-focused option', async ({ page }) => {
            await page.keyboard.press('Tab');

            await expect(page.getByTestId('e2eList')).toHaveClass(/cdk-keyboard-focused/);
            await expect(page.getByTestId('option-1')).toHaveClass(/kbq-focused/);
            await expect(getOptionAction(page, 'option-1')).toBeVisible();

            await page.keyboard.press('ArrowDown');

            await expect(getOptionAction(page, 'option-2')).toBeVisible();
            await expect(getOptionAction(page, 'option-1')).toBeHidden();
        });

        test('does not pin the action when Tab cannot reach it', async ({ page }) => {
            await page.getByTestId('option-1').click();
            await page.mouse.move(0, 0);

            await page.keyboard.press('Tab');

            await expect(getOptionAction(page, 'option-1')).toBeHidden();
            await expect(page.getByTestId('option-1')).not.toHaveClass(/kbq-action-button-focused/);
        });

        test('opens the action dropdown with the keyboard alone', async ({ page }) => {
            await page.keyboard.press('Tab');
            // Second Tab moves focus from the option onto its now-visible action.
            await page.keyboard.press('Tab');

            await expect(page.getByTestId('option-1').locator('kbq-option-action')).toBeFocused();

            await page.keyboard.press('Enter');

            await expect(page.getByTestId('dropdownItem')).toBeVisible();
        });

        test('keeps the action visible while its dropdown is open and after it closes', async ({ page }) => {
            // The action is only clickable once the option is hovered — that is the whole point.
            await page.getByTestId('option-1').hover();
            await page.getByTestId('option-1').locator('kbq-option-action').click();
            await expect(page.getByTestId('dropdownItem')).toBeVisible();

            // The pointer is off the option, so only the `kbq-action-button-focused` latch keeps it up.
            await page.mouse.move(0, 0);
            await expect(getOptionAction(page, 'option-1')).toBeVisible();

            // On close the action is re-focused, so it must stay visible — otherwise focus would
            // land on an invisible control (WCAG 2.4.7).
            await page.getByTestId('dropdownItem').click();
            await expect(page.getByTestId('dropdownItem')).toBeHidden();
            await expect(page.getByTestId('option-1')).toHaveClass(/kbq-action-button-focused/);
            await expect(getOptionAction(page, 'option-1')).toBeVisible();
        });
    });
});
