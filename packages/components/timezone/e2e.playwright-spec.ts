import { expect, Locator, Page, test } from '@playwright/test';
import { e2eEnableDarkTheme, e2eGoToRootPage } from '../../e2e/utils';

test.describe('KbqTimezoneModule', () => {
    test.describe('E2eTimezoneStates', () => {
        const getComponent = (page: Page) => page.getByTestId('e2eTimezoneStates');
        const getTimezoneSelect = (locator: Locator) => locator.getByTestId('e2eTimezoneSelect');
        const getTimezoneSelectWithSearch = (locator: Locator) => locator.getByTestId('e2eTimezoneSelectWithSearch');

        test('light theme', async ({ page }) => {
            await e2eGoToRootPage(page);
            const screenshotTarget = getComponent(page);
            const timezone = getTimezoneSelect(screenshotTarget);

            await timezone.click();

            await expect(getComponent(page)).toHaveScreenshot();
        });

        test('dark theme', async ({ page }) => {
            await e2eGoToRootPage(page);
            await e2eEnableDarkTheme(page);
            const screenshotTarget = getComponent(page);
            const timezone = getTimezoneSelect(screenshotTarget);

            await timezone.click();

            await expect(getComponent(page)).toHaveScreenshot();
        });

        test('opened by Enter', async ({ page }) => {
            await e2eGoToRootPage(page);
            const screenshotTarget = getComponent(page);
            const timezone = getTimezoneSelectWithSearch(screenshotTarget);

            await timezone.focus();
            await page.keyboard.press('Enter');

            await expect(getComponent(page)).toHaveScreenshot();
        });
    });
});
