import { expect, Locator, Page, test } from '@playwright/test';
import { e2eEnableDarkTheme } from '../../e2e/utils';

test.describe('KbqAutocompleteModule', () => {
    test.describe('E2eAutocompleteStates', () => {
        const getComponent = (page: Page): Locator => page.getByTestId('e2eAutocompleteStates');
        const getAutocompleteInput = (page: Page): Locator => page.getByTestId('e2eAutocompleteInput');

        test('states', async ({ page }) => {
            await page.goto('/E2eAutocompleteStates');
            await getAutocompleteInput(page).focus();
            await page.keyboard.press('ArrowDown');
            await expect(getComponent(page)).toHaveScreenshot('01-light.png');
            await e2eEnableDarkTheme(page);
            await expect(getComponent(page)).toHaveScreenshot('01-dark.png');
        });
    });
});
