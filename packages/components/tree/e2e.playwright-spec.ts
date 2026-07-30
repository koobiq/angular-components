import { expect, Page, test } from '@playwright/test';
import { e2eEnableDarkTheme } from '../../e2e/utils';

test.describe('KbqTreeModule', () => {
    test.describe('E2eTreeStates', () => {
        const getComponent = (page: Page) => page.getByTestId('e2eTreeStates');

        test('states', async ({ page }) => {
            await page.goto('/E2eTreeStates');

            await expect(getComponent(page)).toHaveScreenshot('01-light.png');
            await e2eEnableDarkTheme(page);
            await expect(getComponent(page)).toHaveScreenshot('01-dark.png');
        });
    });

    test.describe('E2eTreeTwoLineNode', () => {
        const getComponent = (page: Page) => page.getByTestId('e2eTreeTwoLineNode');

        test('states', async ({ page }) => {
            await page.goto('/E2eTreeTwoLineNode');

            await expect(getComponent(page)).toHaveScreenshot('02-light.png');
            await e2eEnableDarkTheme(page);
            await expect(getComponent(page)).toHaveScreenshot('02-dark.png');
        });
    });

    test.describe('E2eTreeOptionActionVisibility', () => {
        const getOptionAction = (page: Page, option: string) =>
            page.getByTestId(option).locator('.kbq-action-container');

        test.beforeEach(async ({ page }) => {
            await page.goto('/E2eTreeOptionActionVisibility');
        });

        test('reveals the action on hover only', async ({ page }) => {
            await expect(getOptionAction(page, 'node-1')).toBeHidden();

            await page.getByTestId('node-1').hover();
            await expect(getOptionAction(page, 'node-1')).toBeVisible();

            await page.mouse.move(0, 0);
            await expect(getOptionAction(page, 'node-1')).toBeHidden();
        });

        test('hides the action of a mouse-focused option once the pointer leaves', async ({ page }) => {
            await page.getByTestId('node-1').click();
            await page.mouse.move(0, 0);

            await expect(page.getByTestId('e2eTree')).not.toHaveClass(/cdk-keyboard-focused/);
            await expect(getOptionAction(page, 'node-1')).toBeHidden();
        });

        test('reveals the action of the keyboard-focused option', async ({ page }) => {
            // Tab focuses the tree itself; the roving focus only enters an option on the first arrow.
            await page.keyboard.press('Tab');
            await expect(page.getByTestId('e2eTree')).toHaveClass(/cdk-keyboard-focused/);
            await expect(getOptionAction(page, 'node-1')).toBeHidden();

            await page.keyboard.press('ArrowDown');

            await expect(page.getByTestId('node-1')).toHaveClass(/kbq-focused/);
            await expect(getOptionAction(page, 'node-1')).toBeVisible();

            await page.keyboard.press('ArrowDown');

            await expect(getOptionAction(page, 'node-2')).toBeVisible();
            // node-1 lost the roving focus, so its action goes away with it.
            await expect(page.getByTestId('node-1')).not.toHaveClass(/kbq-focused/);
            await expect(getOptionAction(page, 'node-1')).toBeHidden();
        });

        test('does not pin the action when Tab cannot reach it', async ({ page }) => {
            await page.getByTestId('node-1').click();
            await page.mouse.move(0, 0);

            // Before the fix `hasFocus` was set even though the hidden action never took focus,
            // latching `kbq-action-button-focused` on the option permanently.
            await page.keyboard.press('Tab');

            await expect(getOptionAction(page, 'node-1')).toBeHidden();
            await expect(page.getByTestId('node-1')).not.toHaveClass(/kbq-action-button-focused/);
        });
    });
});
