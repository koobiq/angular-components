import { expect, Page, test } from '@playwright/test';
import { e2eEnableDarkTheme } from '../../e2e/utils';

test.describe('KbqMarkdownModule', () => {
    test.describe('E2eMarkdownStates', () => {
        const getComponent = (page: Page) => page.getByTestId('e2eMarkdownStates');

        test('states', async ({ page }) => {
            await page.goto('/E2eMarkdownStates');
            await expect(getComponent(page)).toHaveScreenshot('01-light.png');
            await e2eEnableDarkTheme(page);
            await expect(getComponent(page)).toHaveScreenshot('01-dark.png');
        });

        test('shows the focus ring of a link focused from the keyboard only', async ({ page }) => {
            await page.goto('/E2eMarkdownStates');

            const link = getComponent(page).locator('.kbq-markdown__a').first();

            // A key press puts the browser into keyboard modality, as Tab does
            await page.keyboard.press('Shift');
            await link.focus();
            await expect(link).toHaveCSS('outline-style', 'solid');

            await link.blur();
            await link.click();
            await expect(link).toBeFocused();
            await expect(link).toHaveCSS('outline-style', 'none');
        });
    });
});
