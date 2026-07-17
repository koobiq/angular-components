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
        });

        test('with icon', async ({ page }) => {
            await page.goto('/E2eButtonStateAndStyle');
            const locator = getComponent(page);

            await togglePrefix(locator);
            await toggleTitle(locator);

            await expect(getScreenshotTarget(locator)).toHaveScreenshot('02-light.png');
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
