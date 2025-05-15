import { expect, test } from '@playwright/test';

test.describe('KbqButton', () => {
    test('color and style', async ({ page }) => {
        await page.goto('/ru/components/button');
        await expect(page.locator('button-fill-and-style-example')).toHaveScreenshot();
    });
});
