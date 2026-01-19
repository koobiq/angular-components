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
            const { width, height } = (await getFirstToggle(component).boundingBox()) ?? {};

            expect(width).toBe(28);
            expect(height).toBe(16);

            await getBigToggle(component).click();

            expect(width).toBe(28);
            expect(height).toBe(16);
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
});
