import { expect, Locator, Page, test } from '@playwright/test';
import { e2eEnableDarkTheme } from '../../e2e/utils';

test.describe('KbqSelectModule', () => {
    test.describe('E2eSelectStates', () => {
        const getComponent = (page: Page) => page.getByTestId('e2eSelectStates');
        const getSelect = (locator: Locator) => locator.getByTestId('e2eSelect');

        test('states', async ({ page }) => {
            await page.goto('/E2eSelectStates');
            const screenshotTarget = getComponent(page);
            const select = getSelect(screenshotTarget);

            await select.click();

            await expect(getComponent(page)).toHaveScreenshot('01-light.png');
            await e2eEnableDarkTheme(page);
            await expect(getComponent(page)).toHaveScreenshot('01-dark.png');
        });
    });

    test.describe('E2eMultiSelectStates', () => {
        const getComponent = (page: Page) => page.getByTestId('e2eMultiselectStates');
        const getSelect = (locator: Locator) => locator.getByTestId('e2eMultiSelect');

        test('states', async ({ page }) => {
            await page.goto('/E2eMultiSelectStates');
            const screenshotTarget = getComponent(page);
            const select = getSelect(screenshotTarget);

            await select.click();

            await expect(getComponent(page)).toHaveScreenshot('02-light.png');
            await e2eEnableDarkTheme(page);
            await expect(getComponent(page)).toHaveScreenshot('02-dark.png');
        });
    });

    test.describe('E2eMultilineSelectStates', () => {
        const getComponent = (page: Page) => page.getByTestId('e2eMultilineSelectStates');
        const getSelect = (locator: Locator) => locator.getByTestId('e2eMultilineSelect');

        test('states', async ({ page }) => {
            await page.goto('/E2eMultilineSelectStates');
            const screenshotTarget = getComponent(page);
            const select = getSelect(screenshotTarget);

            await select.click();

            await expect(getComponent(page)).toHaveScreenshot('03-light.png');
            await e2eEnableDarkTheme(page);
            await expect(getComponent(page)).toHaveScreenshot('03-dark.png');
        });
    });

    test.describe('E2eSelectWithSearchAndFooter', () => {
        const getComponent = (page: Page) => page.getByTestId('e2eSelectWithSearchAndFooter');
        const getSelect = (locator: Locator) => locator.getByTestId('e2eSelect');

        test('states', async ({ page }) => {
            await page.goto('/E2eSelectWithSearchAndFooter');
            const screenshotTarget = getComponent(page);
            const select = getSelect(screenshotTarget);

            await select.click();

            await expect(getComponent(page)).toHaveScreenshot('04-light.png');
            await e2eEnableDarkTheme(page);
            await expect(getComponent(page)).toHaveScreenshot('04-dark.png');
        });
    });
});
