import { expect, Locator, Page, test } from '@playwright/test';
import { devEnableDarkTheme, devGoToRootPage } from '../utils';

test.describe('KbqFileUploadModule', () => {
    test.describe('DevFileUploadStateAndStyle', () => {
        const getComponent = (page: Page) => page.getByTestId('e2eFileUploadStateAndStyle');
        const getSingleFileUploadTable = (locator: Locator) => locator.getByTestId('e2eSingleFileUploadTable');
        const getMultipleFileUploadTable = (locator: Locator) => locator.getByTestId('e2eMultipleFileUploadTable');
        const focusFileItemViaClick = (locator: Locator) =>
            locator.locator('.dev-focused .kbq-list-selection')?.focus();

        test('KbqSingleFileUploadComponent states', async ({ page }) => {
            await devGoToRootPage(page);
            const locator = getComponent(page);

            const screenshotTarget = getSingleFileUploadTable(locator);

            await expect(screenshotTarget).toHaveScreenshot();
        });

        test(`KbqSingleFileUploadComponent states (dark theme)`, async ({ page }) => {
            await devGoToRootPage(page);
            await devEnableDarkTheme(page);

            const locator = getComponent(page);

            const screenshotTarget = getSingleFileUploadTable(locator);

            await expect(screenshotTarget).toHaveScreenshot();
        });

        test('KbqMultipleFileUploadComponent states', async ({ page }) => {
            await devGoToRootPage(page);
            const locator = getComponent(page);

            const screenshotTarget = getMultipleFileUploadTable(locator);

            await expect(screenshotTarget).toHaveScreenshot();
        });

        test(`KbqMultipleFileUploadComponent states (dark theme)`, async ({ page }) => {
            await devGoToRootPage(page);
            await devEnableDarkTheme(page);

            const locator = getComponent(page);

            const screenshotTarget = getMultipleFileUploadTable(locator);

            await focusFileItemViaClick(screenshotTarget);

            await expect(screenshotTarget).toHaveScreenshot();
        });
    });
});
