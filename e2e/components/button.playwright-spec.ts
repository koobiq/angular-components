import { expect, Locator, Page, test } from '@playwright/test';

const component = {
    stateAndStyle: 'dev-button-state-and-style'
};

test.describe('KbqButtonModule', () => {
    test.describe(component.stateAndStyle, () => {
        const goToPage = (page: Page) => page.goto('');
        const getComponent = (page: Page) => page.locator(component.stateAndStyle);
        const togglePrefix = (locator: Locator) => locator.getByText('show prefix icon').click();
        const toggleTitle = (locator: Locator) => locator.getByText('show title').click();
        const toggleSuffix = (locator: Locator) => locator.getByText('show suffix icon').click();
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
    });
});
