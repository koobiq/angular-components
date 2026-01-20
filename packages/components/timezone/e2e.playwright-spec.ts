import { expect, Locator, Page, test } from '@playwright/test';
import { e2eEnableDarkTheme } from '../../e2e/utils';

test.describe('KbqTimezoneModule', () => {
    test.describe('E2eTimezoneStates', () => {
        const getComponent = (page: Page) => page.getByTestId('e2eTimezoneStates');
        const getTimezoneSelect = (locator: Locator) => locator.getByTestId('e2eTimezoneSelect');
        const getTimezoneSelectWithSearch = (locator: Locator) => locator.getByTestId('e2eTimezoneSelectWithSearch');

        test('states', async ({ page }) => {
            await page.goto('/E2eTimezoneStates');
            const screenshotTarget = getComponent(page);
            const timezone = getTimezoneSelect(screenshotTarget);

            await timezone.click();

            await expect(getComponent(page)).toHaveScreenshot('01-light.png');
            await e2eEnableDarkTheme(page);
            await expect(getComponent(page)).toHaveScreenshot('01-dark.png');
        });

        test('with search', async ({ page }) => {
            await page.goto('/E2eTimezoneStates');
            const screenshotTarget = getComponent(page);
            const timezone = getTimezoneSelectWithSearch(screenshotTarget);

            await timezone.focus();
            await page.keyboard.press('Enter');

            await expect(getComponent(page)).toHaveScreenshot('02-light.png');
        });
    });
});
