import { expect, Locator, Page, test } from '@playwright/test';
import { e2eEnableDarkTheme } from '../../e2e/utils';

test.describe('KbqToggleModule', () => {
    const getScreenshotTarget = (locator: Locator): Locator => locator.getByTestId('e2eScreenshotTarget');
    const getIndeterminateToggle = (locator: Locator): Locator => locator.getByTestId('e2eIndeterminateToggle');
    const getBigToggle = (locator: Locator): Locator => locator.getByTestId('e2eBigToggle');

    test.describe('E2eToggleStateAndStyle', () => {
        const getComponent = (page: Page): Locator => page.getByTestId('e2eToggleStateAndStyle');
        const getFirstToggle = (locator: Locator): Locator => locator.locator('kbq-toggle').first();

        test('states', async ({ page }) => {
            await page.goto('/E2eToggleStateAndStyle');

            await expect(getScreenshotTarget(getComponent(page))).toHaveScreenshot('01-light.png');
            await e2eEnableDarkTheme(page);
            await expect(getScreenshotTarget(getComponent(page))).toHaveScreenshot('01-dark.png');
        });

        test('should have correct size', async ({ page }) => {
            await page.goto('/E2eToggleStateAndStyle');

            const component = getComponent(page);
            // The switch itself, not the host: the host is as tall as one line of text, so that a
            // toggle occupies the same box as a checkbox or a radio button.
            const bar = getFirstToggle(component).locator('.kbq-toggle-bar');

            await expect(bar).toHaveCSS('width', '28px');
            await expect(bar).toHaveCSS('height', '16px');

            await getBigToggle(component).click();

            await expect(bar).toHaveCSS('width', '28px');
            await expect(bar).toHaveCSS('height', '16px');
        });

        test('indeterminate', async ({ page }) => {
            await page.goto('/E2eToggleStateAndStyle');

            const component = getComponent(page);

            await getIndeterminateToggle(component).click();
            await expect(getScreenshotTarget(component)).toHaveScreenshot('02-light.png');
        });
    });

    test.describe('E2eToggleWithTextAndCaption', () => {
        const getComponent = (page: Page): Locator => page.getByTestId('e2eToggleWithTextAndCaption');

        test('states', async ({ page }) => {
            await page.goto('/E2eToggleWithTextAndCaption');

            await expect(getScreenshotTarget(getComponent(page))).toHaveScreenshot('03-light.png');
            await e2eEnableDarkTheme(page);
            await expect(getScreenshotTarget(getComponent(page))).toHaveScreenshot('03-dark.png');
        });

        test('big', async ({ page }) => {
            await page.goto('/E2eToggleWithTextAndCaption');

            const component = getComponent(page);

            await getBigToggle(component).click();
            await expect(getScreenshotTarget(component)).toHaveScreenshot('04-light.png');
        });
    });

    test.describe('E2eToggleHeight', () => {
        const getComponent = (page: Page): Locator => page.getByTestId('e2eToggleHeight');

        // The component is measured alongside its wrapper: collapsed to zero height it would still
        // leave the wrapper at the line height inherited from the page and hide the defect.
        const getTargets = (locator: Locator): Locator[] =>
            ['e2eToggleWithoutLabel', 'e2eToggleWithLabel']
                .map((testId) => locator.getByTestId(testId))
                .flatMap((wrapper) => [wrapper, wrapper.locator('kbq-toggle')]);

        test('should take the same height with and without label', async ({ page }) => {
            await page.goto('/E2eToggleHeight');

            const component = getComponent(page);

            for (const target of getTargets(component)) {
                await expect(target).toHaveCSS('height', '20px');
            }

            await getBigToggle(component).click();

            for (const target of getTargets(component)) {
                await expect(target).toHaveCSS('height', '24px');
            }
        });
    });
});
