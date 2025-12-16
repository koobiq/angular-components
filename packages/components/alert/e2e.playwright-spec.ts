import { expect, Locator, Page, test } from '@playwright/test';
import { e2eEnableDarkTheme, e2eGoToRootPage } from '../../e2e/utils';

test.describe('KbqAlertModule', () => {
    test.describe('E2eAlertStateAndStyle', () => {
        const getComponent = (page: Page) => page.getByTestId('e2eAlertStateAndStyle');
        const getTestTable = (locator: Locator) => locator.getByTestId('e2eAlertTable');

        test('KbqAlert states', async ({ page }) => {
            await e2eGoToRootPage(page);
            const locator = getComponent(page);

            const screenshotTarget = getTestTable(locator);

            await expect(screenshotTarget).toHaveScreenshot();
        });

        test(`KbqAlert states (dark theme)`, async ({ page }) => {
            await e2eGoToRootPage(page);
            await e2eEnableDarkTheme(page);

            const locator = getComponent(page);

            const screenshotTarget = getTestTable(locator);

            await expect(screenshotTarget).toHaveScreenshot();
        });
    });
});
