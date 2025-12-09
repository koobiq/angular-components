import { expect, Locator, Page, test } from '@playwright/test';
import { devEnableDarkTheme, devGoToRootPage } from '../../e2e/utils';

test.describe('KbqAlertModule', () => {
    test.describe('E2eAlertStateAndStyle', () => {
        const getComponent = (page: Page) => page.getByTestId('e2eAlertStateAndStyle');
        const getTestTable = (locator: Locator) => locator.getByTestId('e2eAlertTable');

        test('KbqAlert states', async ({ page }) => {
            await devGoToRootPage(page);
            const locator = getComponent(page);

            const screenshotTarget = getTestTable(locator);

            await expect(screenshotTarget).toHaveScreenshot();
        });

        test(`KbqAlert states (dark theme)`, async ({ page }) => {
            await devGoToRootPage(page);
            await devEnableDarkTheme(page);

            const locator = getComponent(page);

            const screenshotTarget = getTestTable(locator);

            await expect(screenshotTarget).toHaveScreenshot();
        });
    });
});
