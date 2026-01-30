import { expect, Locator, Page, test } from '@playwright/test';
import { e2eEnableDarkTheme } from '../../e2e/utils';

test.describe('KbqInlineEdit', () => {
    test.describe('E2eInlineEditStates', () => {
        const getComponent = (page: Page) => page.getByTestId('e2eInlineEditStates');
        const getTable = (locator: Locator) => locator.getByTestId('e2eInlineEditList');
        const clickOpenTrigger = (locator: Locator) => locator.getByTestId('e2eInlineEditOpenTrigger').click();
        const clickFocusTrigger = (locator: Locator) => locator.getByTestId('e2eInlineEditFocusTrigger').click();

        test('edit states', async ({ page }) => {
            await page.goto('/E2eInlineEditStates');

            const component = getComponent(page);

            const screenshotTarget = getTable(component);

            await clickOpenTrigger(component);

            await expect(screenshotTarget).toHaveScreenshot('01-light.png');
            await e2eEnableDarkTheme(page);
            await expect(screenshotTarget).toHaveScreenshot('01-dark.png');
        });

        test('view states', async ({ page }) => {
            await page.goto('/E2eInlineEditStates');

            const component = getComponent(page);

            const screenshotTarget = getTable(component);

            await clickFocusTrigger(component);

            await expect(screenshotTarget).toHaveScreenshot('02-light.png');
            await e2eEnableDarkTheme(page);
            await expect(screenshotTarget).toHaveScreenshot('02-dark.png');
        });
    });
});
