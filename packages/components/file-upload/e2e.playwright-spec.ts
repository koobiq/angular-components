import { expect, Locator, Page, test } from '@playwright/test';
import { e2eEnableDarkTheme, e2eGoToRootPage } from '../../e2e/utils';

test.describe('KbqFileUploadModule', () => {
    test.describe('E2eFileUploadStateAndStyle', () => {
        const getComponent = (page: Page) => page.getByTestId('e2eFileUploadStateAndStyle');
        const getSingleFileUploadTable = (locator: Locator) => locator.getByTestId('e2eSingleFileUploadTable');
        const getMultipleFileUploadTable = (locator: Locator) => locator.getByTestId('e2eMultipleFileUploadTable');
        const focusFileItem = (locator: Locator) => locator.locator('.dev-focused .kbq-list-selection')?.focus();

        test('KbqSingleFileUploadComponent states', async ({ page }) => {
            await e2eGoToRootPage(page);
            const locator = getComponent(page);

            const screenshotTarget = getSingleFileUploadTable(locator);

            await expect(screenshotTarget).toHaveScreenshot();
        });

        test(`KbqSingleFileUploadComponent states (dark theme)`, async ({ page }) => {
            await e2eGoToRootPage(page);
            await e2eEnableDarkTheme(page);

            const locator = getComponent(page);

            const screenshotTarget = getSingleFileUploadTable(locator);

            await expect(screenshotTarget).toHaveScreenshot();
        });

        test('KbqMultipleFileUploadComponent states', async ({ page }) => {
            await e2eGoToRootPage(page);
            const locator = getComponent(page);

            const screenshotTarget = getMultipleFileUploadTable(locator);

            await expect(screenshotTarget).toHaveScreenshot();
        });

        test(`KbqMultipleFileUploadComponent states (dark theme)`, async ({ page }) => {
            await e2eGoToRootPage(page);
            await e2eEnableDarkTheme(page);

            const locator = getComponent(page);

            const screenshotTarget = getMultipleFileUploadTable(locator);

            await focusFileItem(screenshotTarget);

            await expect(screenshotTarget).toHaveScreenshot();
        });
    });
});
