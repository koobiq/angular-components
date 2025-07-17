import { expect, Locator, Page, test } from '@playwright/test';

const getThemeToggle = (page: Page) => page.getByTestId('e2eThemeToggle');

test.describe('KbqButtonModule', () => {
    test.describe('DevButtonStateAndStyle', () => {
        const goToPage = (page: Page) => page.goto('/');
        const getComponent = (page: Page) => page.getByTestId('e2eButtonStateAndStyle');
        const togglePrefix = (locator: Locator) => locator.getByTestId('e2eShowPrefixIcon').click();
        const toggleTitle = (locator: Locator) => locator.getByTestId('e2eShowTitle').click();
        const toggleSuffix = (locator: Locator) => locator.getByTestId('e2eShowSuffixIcon').click();
        const getScreenshotTarget = (locator: Locator) => locator.locator('table');

        test('button with title', async ({ page }) => {
            await goToPage(page);
            const locator = getComponent(page);

            await expect(getScreenshotTarget(locator)).toHaveScreenshot();
        });

        test('button with icon', async ({ page }) => {
            await goToPage(page);
            const locator = getComponent(page);

            await togglePrefix(locator);
            await toggleTitle(locator);

            await expect(getScreenshotTarget(locator)).toHaveScreenshot();
        });

        test('button with title, prefix and suffix', async ({ page }) => {
            await goToPage(page);
            const locator = getComponent(page);

            await togglePrefix(locator);
            await toggleSuffix(locator);

            await expect(getScreenshotTarget(locator)).toHaveScreenshot();
        });

        test('button with title, prefix and suffix (dark theme)', async ({ page }) => {
            await goToPage(page);
            await getThemeToggle(page).click();

            const locator = getComponent(page);

            await togglePrefix(locator);
            await toggleSuffix(locator);

            await expect(getScreenshotTarget(locator)).toHaveScreenshot();
        });
    });
});
