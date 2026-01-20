import { expect, Locator, Page, test } from '@playwright/test';
import { e2eEnableDarkTheme } from '../../e2e/utils';

test.describe('KbqTreeSelectModule', () => {
    test.describe('E2eTreeSelectStates', () => {
        const getComponent = (page: Page) => page.getByTestId('e2eTreeSelectStates');
        const getTreeSelect = (locator: Locator) => locator.getByTestId('e2eTreeSelect');

        test('states', async ({ page }) => {
            await page.goto('/E2eTreeSelectStates');
            const screenshotTarget = getComponent(page);
            const select = getTreeSelect(screenshotTarget);

            await select.click();

            await expect(getComponent(page)).toHaveScreenshot('01-light.png');
            await e2eEnableDarkTheme(page);
            await expect(getComponent(page)).toHaveScreenshot('01-dark.png');
        });
    });

    test.describe('E2eMultiTreeSelectStates', () => {
        const getComponent = (page: Page) => page.getByTestId('e2eMultiTreeSelectStates');
        const getTreeSelect = (locator: Locator) => locator.getByTestId('e2eMultiTreeSelect');

        test('states', async ({ page }) => {
            await page.goto('/E2eMultiTreeSelectStates');
            const screenshotTarget = getComponent(page);
            const select = getTreeSelect(screenshotTarget);

            await select.focus();
            await page.keyboard.press('Enter');

            await expect(getComponent(page)).toHaveScreenshot('02-light.png');
            await e2eEnableDarkTheme(page);
            await expect(getComponent(page)).toHaveScreenshot('02-dark.png');
        });
    });

    test.describe('E2eMultilineTreeSelectStates', () => {
        const getComponent = (page: Page) => page.getByTestId('e2eMultilineTreeSelectStates');
        const getTreeSelect = (locator: Locator) => locator.getByTestId('e2eMultilineTreeSelect');

        test('states', async ({ page }) => {
            await page.goto('/E2eMultilineTreeSelectStates');
            const screenshotTarget = getComponent(page);
            const select = getTreeSelect(screenshotTarget);

            await select.focus();
            await page.keyboard.press('Enter');

            await expect(getComponent(page)).toHaveScreenshot('03-light.png');
            await e2eEnableDarkTheme(page);
            await expect(getComponent(page)).toHaveScreenshot('03-dark.png');
        });
    });
});
