import { expect, Page, test } from '@playwright/test';

test.describe('[Core] Typography', () => {
    test.describe('E2eTypographyStyles', () => {
        const getComponent = (page: Page) => page.getByTestId('e2eTypographyStyles');

        test('styles', async ({ page }) => {
            await page.goto('/E2eTypographyStyles');
            await expect(getComponent(page)).toHaveScreenshot('01-light.png');
        });
    });
});
