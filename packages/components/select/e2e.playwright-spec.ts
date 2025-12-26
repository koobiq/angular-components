import { expect, Locator, Page, test } from '@playwright/test';
import { e2eEnableDarkTheme, e2eGoToRootPage } from '../../e2e/utils';

test.describe('KbqSelectModule', () => {
    test.describe('E2eSelectStates', () => {
        const getComponent = (page: Page) => page.getByTestId('e2eSelectStates');
        const getSelect = (locator: Locator) => locator.getByTestId('e2eSelect');

        test('select default', async ({ page }) => {
            await e2eGoToRootPage(page);
            const screenshotTarget = getComponent(page);
            const select = getSelect(screenshotTarget);

            await select.click();

            await expect(getComponent(page)).toHaveScreenshot();
        });

        test('select (dark theme)', async ({ page }) => {
            await e2eGoToRootPage(page);
            await e2eEnableDarkTheme(page);
            const screenshotTarget = getComponent(page);
            const select = getSelect(screenshotTarget);

            await select.click();

            await expect(getComponent(page)).toHaveScreenshot();
        });
    });

    test.describe('E2eMultiSelectStates', () => {
        const getComponent = (page: Page) => page.getByTestId('e2eMultiselectStates');
        const getSelect = (locator: Locator) => locator.getByTestId('e2eMultiSelect');

        test('MultiSelect default', async ({ page }) => {
            await e2eGoToRootPage(page);
            const screenshotTarget = getComponent(page);
            const select = getSelect(screenshotTarget);

            await select.click();

            await expect(getComponent(page)).toHaveScreenshot();
        });

        test('MultiSelect (dark theme)', async ({ page }) => {
            await e2eGoToRootPage(page);
            await e2eEnableDarkTheme(page);
            const screenshotTarget = getComponent(page);
            const select = getSelect(screenshotTarget);

            await select.click();

            await expect(getComponent(page)).toHaveScreenshot();
        });
    });

    test.describe('E2eMultilineSelectStates', () => {
        const getComponent = (page: Page) => page.getByTestId('e2eMultilineSelectStates');
        const getSelect = (locator: Locator) => locator.getByTestId('e2eMultilineSelect');

        test('Multiline default', async ({ page }) => {
            await e2eGoToRootPage(page);
            const screenshotTarget = getComponent(page);
            const select = getSelect(screenshotTarget);

            await select.click();

            await expect(getComponent(page)).toHaveScreenshot();
        });

        test('Multiline (dark theme)', async ({ page }) => {
            await e2eGoToRootPage(page);
            await e2eEnableDarkTheme(page);
            const screenshotTarget = getComponent(page);
            const select = getSelect(screenshotTarget);

            await select.click();

            await expect(getComponent(page)).toHaveScreenshot();
        });
    });

    test.describe('E2eSelectWithSearchAndFooter', () => {
        const getComponent = (page: Page) => page.getByTestId('e2eSelectWithSearchAndFooter');
        const getSelect = (locator: Locator) => locator.getByTestId('e2eSelect');

        test('SelectWithSearchAndFooter default', async ({ page }) => {
            await e2eGoToRootPage(page);
            const screenshotTarget = getComponent(page);
            const select = getSelect(screenshotTarget);

            await select.click();

            await expect(getComponent(page)).toHaveScreenshot();
        });

        test('SelectWithSearchAndFooter (dark theme)', async ({ page }) => {
            await e2eGoToRootPage(page);
            await e2eEnableDarkTheme(page);
            const screenshotTarget = getComponent(page);
            const select = getSelect(screenshotTarget);

            await select.click();

            await expect(getComponent(page)).toHaveScreenshot();
        });
    });
});
