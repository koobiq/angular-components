import { expect, Locator, Page, test } from '@playwright/test';
import { e2eEnableDarkTheme } from '../../e2e/utils';

test.describe('KbqDivider', () => {
    test.describe('E2eDividerStateAndStyle', () => {
        const getComponent = (page: Page) => page.getByTestId('e2eDividerStateAndStyle');
        const getTestTable = (locator: Locator) => locator.getByTestId('e2eDividerTable');

        test('states', async ({ page }) => {
            await page.goto('/E2eDividerStateAndStyle');
            const locator = getComponent(page);
            const screenshotTarget = getTestTable(locator);

            await expect(screenshotTarget).toHaveScreenshot('01-light.png');
            await e2eEnableDarkTheme(page);
            await expect(screenshotTarget).toHaveScreenshot('01-dark.png');
        });

        test('vertical divider spans a centered flex row', async ({ page }) => {
            await page.goto('/E2eDividerStateAndStyle');

            const toolbar = getComponent(page).getByTestId('e2eDividerToolbar');
            const toolbarBox = (await toolbar.boundingBox())!;
            const dividerBox = (await toolbar.locator('kbq-divider').boundingBox())!;

            expect(dividerBox.height).toBeGreaterThan(toolbarBox.height / 2);
        });
    });
});
