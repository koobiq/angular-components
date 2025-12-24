import { expect, Locator, Page, test } from '@playwright/test';
import { e2eGoToRootPage } from '../../e2e/utils';

test.describe('KbqAutocompleteModule', () => {
    test.describe('E2eAutocompleteStates', () => {
        const getComponent = (page: Page): Locator => page.getByTestId('e2eAutocompleteStates');
        const getAutocompleteInput = (page: Page): Locator => page.getByTestId('e2eAutocompleteInput');

        test('light theme', async ({ page }) => {
            await e2eGoToRootPage(page);
            await getAutocompleteInput(page).focus();
            await page.keyboard.press('ArrowDown');
            await expect(getComponent(page)).toHaveScreenshot();
        });

        test('dark theme', async ({ page }) => {
            await e2eGoToRootPage(page);
            await getAutocompleteInput(page).focus();
            await page.keyboard.press('ArrowDown');
            await expect(getComponent(page)).toHaveScreenshot();
        });
    });
});
