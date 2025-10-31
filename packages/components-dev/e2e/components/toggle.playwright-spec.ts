import { expect, Locator, Page, test } from '@playwright/test';
import { devEnableDarkTheme, devGoToRootPage } from '../utils';

test.describe('KbqToggleModule', () => {
    test.describe('DevToggleStateAndStyle', () => {
        const getComponent = (page: Page): Locator => page.getByTestId('e2eToggleStateAndStyle');
        const getScreenshotTarget = (locator: Locator): Locator => locator.getByTestId('e2eScreenshotTarget');
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

            const { width, height } = (await getFirstToggle(getComponent(page)).boundingBox()) ?? {};

            expect(width).toBe(28);
            expect(height).toBe(16);
        });
    });

    test.describe('DevToggleWithTextAndCaption', () => {
        const getComponent = (page: Page): Locator => page.getByTestId('e2eToggleWithTextAndCaption');
        const getScreenshotTarget = (locator: Locator): Locator => locator.getByTestId('e2eScreenshotTarget');

        test('default', async ({ page }) => {
            await devGoToRootPage(page);
            await expect(getScreenshotTarget(getComponent(page))).toHaveScreenshot();
        });
    });
});
