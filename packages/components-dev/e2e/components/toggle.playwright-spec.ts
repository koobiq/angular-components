import { expect, Locator, Page, test } from '@playwright/test';
import { devEnableDarkTheme, devGoToRootPage } from '../utils';

test.describe('KbqToggleModule', () => {
    const getScreenshotTarget = (locator: Locator): Locator => locator.getByTestId('e2eScreenshotTarget');
    const getIndeterminateToggle = (locator: Locator): Locator => locator.getByTestId('e2eIndeterminateToggle');
    const getBigToggle = (locator: Locator): Locator => locator.getByTestId('e2eBigToggle');

    test.describe('DevToggleStateAndStyle', () => {
        const getComponent = (page: Page): Locator => page.getByTestId('e2eToggleStateAndStyle');
        const getFirstToggle = (locator: Locator): Locator => locator.locator('kbq-toggle').first();

        test('default', async ({ page }) => {
            await devGoToRootPage(page);
            await expect(getScreenshotTarget(getComponent(page))).toHaveScreenshot();
        });

        test('default (dark theme)', async ({ page }) => {
            await devGoToRootPage(page);
            await devEnableDarkTheme(page);
            await expect(getScreenshotTarget(getComponent(page))).toHaveScreenshot();
        });

        test('should have correct size', async ({ page }) => {
            await devGoToRootPage(page);

            const component = getComponent(page);
            const { width, height } = (await getFirstToggle(component).boundingBox()) ?? {};

            expect(width).toBe(28);
            expect(height).toBe(16);

            await getBigToggle(component).click();

            expect(width).toBe(28);
            expect(height).toBe(16);
        });

        test('indeterminate', async ({ page }) => {
            await devGoToRootPage(page);

            const component = getComponent(page);

            await getIndeterminateToggle(component).click();
            await expect(getScreenshotTarget(component)).toHaveScreenshot();
        });
    });

    test.describe('DevToggleWithTextAndCaption', () => {
        const getComponent = (page: Page): Locator => page.getByTestId('e2eToggleWithTextAndCaption');

        test('default', async ({ page }) => {
            await devGoToRootPage(page);
            await expect(getScreenshotTarget(getComponent(page))).toHaveScreenshot();
        });

        test('default (dark theme)', async ({ page }) => {
            await devGoToRootPage(page);
            await devEnableDarkTheme(page);
            await expect(getScreenshotTarget(getComponent(page))).toHaveScreenshot();
        });

        test('big', async ({ page }) => {
            await devGoToRootPage(page);

            const component = getComponent(page);

            await getBigToggle(component).click();
            await expect(getScreenshotTarget(component)).toHaveScreenshot();
        });
    });
});
