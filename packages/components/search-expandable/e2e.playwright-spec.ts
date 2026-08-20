import { expect, Locator, Page, test } from '@playwright/test';
import { e2eEnableDarkTheme } from '../../e2e/utils';

test.describe('KbqSearchExpandableModule', () => {
    test.describe('E2eSearchExpandableStates', () => {
        const getComponent = (page: Page) => page.getByTestId('e2eSearchExpandableStates');
        const getScreenshotTarget = (locator: Locator) => locator.getByTestId('e2eScreenshotTarget');

        test('states', async ({ page }) => {
            await page.goto('/E2eSearchExpandableStates');
            const locator = getComponent(page);

            await expect(getScreenshotTarget(locator)).toHaveScreenshot('01-light.png');
            await e2eEnableDarkTheme(page);
            await expect(getScreenshotTarget(locator)).toHaveScreenshot('01-dark.png');
        });

        test('expands on click, accepts typing and collapses on escape', async ({ page }) => {
            await page.goto('/E2eSearchExpandableStates');

            const component = page.getByTestId('e2eSearchExpandableCollapsed');
            const toggleButton = component.locator('.kbq-search-expandable__button');

            await toggleButton.click();

            const input = component.locator('input');

            await expect(input).toBeFocused();

            await input.fill('query');

            await expect(input).toHaveValue('query');

            await input.press('Escape');

            await expect(component.locator('input')).toHaveCount(0);
            await expect(toggleButton).toBeFocused();
        });
    });
});
