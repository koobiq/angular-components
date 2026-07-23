import { expect, Locator, Page, test } from '@playwright/test';
import { e2eEnableDarkTheme } from '../../e2e/utils';

test.describe('KbqTimezoneModule', () => {
    test.describe('E2eTimezoneStates', () => {
        const getComponent = (page: Page) => page.getByTestId('e2eTimezoneStates');

        test('states', async ({ page }) => {
            await page.goto('/E2eTimezoneStates');

            await expect(getComponent(page)).toHaveScreenshot('01-light.png');
            await e2eEnableDarkTheme(page);
            await expect(getComponent(page)).toHaveScreenshot('01-dark.png');
        });
    });

    test.describe('E2eTimezoneWithSearch', () => {
        const getComponent = (page: Page) => page.getByTestId('e2eTimezoneWithSearch');
        const getTimezoneSelect = (locator: Locator) => locator.getByTestId('e2eTimezoneSelectWithSearch');

        test('with search', async ({ page }) => {
            await page.goto('/E2eTimezoneWithSearch');
            const timezone = getTimezoneSelect(getComponent(page));

            await timezone.focus();
            await page.keyboard.press('Enter');

            await expect(getComponent(page)).toHaveScreenshot('02-light.png');
        });
    });

    test.describe('E2eTimezonePanelStates', () => {
        const getComponent = (page: Page) => page.getByTestId('e2eTimezonePanelStates');
        const getTimezoneSelect = (locator: Locator) => locator.getByTestId('e2eTimezoneSelect');

        test('option states', async ({ page }) => {
            await page.goto('/E2eTimezonePanelStates');
            const timezone = getTimezoneSelect(getComponent(page));

            await timezone.click();

            await expect(getComponent(page)).toHaveScreenshot('03-light.png');
            await e2eEnableDarkTheme(page);
            await expect(getComponent(page)).toHaveScreenshot('03-dark.png');
        });
    });
});
