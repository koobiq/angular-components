import { expect, Locator, Page, test } from '@playwright/test';
import { devEnableDarkTheme, devGoToRootPage } from '../../e2e/utils';

test.describe('KbqClampedText', () => {
    test.describe('E2eClampedTextStateAndStyle', () => {
        const getComponent = (page: Page) => page.getByTestId('e2eClampedTextStateAndStyle');
        const getTestTable = (locator: Locator) => locator.getByTestId('e2eClampedTextTable');

        test('KbqClampedText states', async ({ page }) => {
            await devGoToRootPage(page);
            const locator = getComponent(page);

            const screenshotTarget = getTestTable(locator);

            await expect(screenshotTarget).toHaveScreenshot();
        });

        test(`KbqClampedText states (dark theme)`, async ({ page }) => {
            await devGoToRootPage(page);
            await devEnableDarkTheme(page);

            const locator = getComponent(page);

            const screenshotTarget = getTestTable(locator);

            await expect(screenshotTarget).toHaveScreenshot();
        });
    });
});
