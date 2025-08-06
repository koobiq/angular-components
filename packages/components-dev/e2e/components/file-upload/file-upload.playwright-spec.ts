import { expect, Locator, Page, test } from '@playwright/test';

const getThemeToggle = (page: Page) => page.getByTestId('e2eThemeToggle');

test.describe('KbqFileUploadModule', () => {
    test.describe('DevFileUploadStateAndStyle', () => {
        const goToPage = (page: Page) => page.goto('/');
        const getComponent = (page: Page) => page.getByTestId('e2eFileUploadStateAndStyle');
        const getSingleFileUploadTable = (locator: Locator) => locator.getByTestId('e2eSingleFileUploadTable');
        const getMultipleFileUploadTable = (locator: Locator) => locator.getByTestId('e2eMultipleFileUploadTable');

        test('KbqSingleFileUploadComponent states', async ({ page }) => {
            await goToPage(page);
            const locator = getComponent(page);

            const screenshotTarget = getSingleFileUploadTable(locator);

            await expect(screenshotTarget).toHaveScreenshot();
        });

        test(`KbqSingleFileUploadComponent states (dark theme)`, async ({ page }) => {
            await goToPage(page);
            await getThemeToggle(page).click();

            const locator = getComponent(page);

            const screenshotTarget = getSingleFileUploadTable(locator);

            await expect(screenshotTarget).toHaveScreenshot();
        });

        test('KbqMultipleFileUploadComponent states', async ({ page }) => {
            await goToPage(page);
            const locator = getComponent(page);

            const screenshotTarget = getMultipleFileUploadTable(locator);

            await expect(screenshotTarget).toHaveScreenshot();
        });

        test(`KbqMultipleFileUploadComponent states (dark theme)`, async ({ page }) => {
            await goToPage(page);
            await getThemeToggle(page).click();

            const locator = getComponent(page);

            const screenshotTarget = getMultipleFileUploadTable(locator);

            await expect(screenshotTarget).toHaveScreenshot();
        });
    });
});
