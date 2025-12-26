import { expect, Locator, Page, test } from '@playwright/test';
import { e2eEnableDarkTheme, e2eGoToRootPage } from '../../e2e/utils';

test.describe('KbqTreeSelectModule', () => {
    test.describe('E2eTreeSelectStates', () => {
        const getComponent = (page: Page) => page.getByTestId('e2eTreeSelectStates');
        const getTreeSelect = (locator: Locator) => locator.getByTestId('e2eTreeSelect');

        test('select default', async ({ page }) => {
            await e2eGoToRootPage(page);
            const screenshotTarget = getComponent(page);
            const select = getTreeSelect(screenshotTarget);

            await select.click();

            await expect(getComponent(page)).toHaveScreenshot();
        });

        test('select (dark theme)', async ({ page }) => {
            await e2eGoToRootPage(page);
            await e2eEnableDarkTheme(page);
            const screenshotTarget = getComponent(page);
            const select = getTreeSelect(screenshotTarget);

            await select.click();

            await expect(getComponent(page)).toHaveScreenshot();
        });
    });

    test.describe('E2eMultiTreeSelectStates', () => {
        const getComponent = (page: Page) => page.getByTestId('e2eMultiTreeSelectStates');
        const getTreeSelect = (locator: Locator) => locator.getByTestId('e2eMultiTreeSelect');

        test('MultiTreeSelect default', async ({ page }) => {
            await e2eGoToRootPage(page);
            const screenshotTarget = getComponent(page);
            const select = getTreeSelect(screenshotTarget);

            await select.focus();
            await page.keyboard.press('Enter');

            await expect(getComponent(page)).toHaveScreenshot();
        });

        test('MultiTreeSelect (dark theme)', async ({ page }) => {
            await e2eGoToRootPage(page);
            await e2eEnableDarkTheme(page);
            const screenshotTarget = getComponent(page);
            const select = getTreeSelect(screenshotTarget);

            await select.focus();
            await page.keyboard.press('Enter');

            await expect(getComponent(page)).toHaveScreenshot();
        });
    });

    test.describe('E2eMultilineTreeSelectStates', () => {
        const getComponent = (page: Page) => page.getByTestId('e2eMultilineTreeSelectStates');
        const getTreeSelect = (locator: Locator) => locator.getByTestId('e2eMultilineTreeSelect');

        test('MultilineTreeSelect default', async ({ page }) => {
            await e2eGoToRootPage(page);
            const screenshotTarget = getComponent(page);
            const select = getTreeSelect(screenshotTarget);

            await select.focus();
            await page.keyboard.press('Enter');

            await expect(getComponent(page)).toHaveScreenshot();
        });

        test('MultilineTreeSelect (dark theme)', async ({ page }) => {
            await e2eGoToRootPage(page);
            await e2eEnableDarkTheme(page);
            const screenshotTarget = getComponent(page);
            const select = getTreeSelect(screenshotTarget);

            await select.focus();
            await page.keyboard.press('Enter');

            await expect(getComponent(page)).toHaveScreenshot();
        });
    });
});
