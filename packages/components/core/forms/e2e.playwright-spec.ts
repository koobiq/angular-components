import { expect, Page, test } from '@playwright/test';

test.describe('KbqFormsModule', () => {
    test.describe('E2eFormHorizontal', () => {
        const getComponent = (page: Page) => page.getByTestId('e2eFormHorizontal');

        test('states', async ({ page }) => {
            await page.goto('/E2eFormHorizontal');
            await expect(getComponent(page)).toHaveScreenshot('01-light.png');
        });
    });
});
