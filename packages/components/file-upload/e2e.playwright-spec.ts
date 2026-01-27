import { expect, Locator, Page, test } from '@playwright/test';
import { e2eEnableDarkTheme } from '../../e2e/utils';

test.describe('KbqFileUploadModule', () => {
    test.describe('E2eFileUploadStateAndStyle', () => {
        const getComponent = (page: Page) => page.getByTestId('e2eFileUploadStateAndStyle');
        const getSingleFileUploadTable = (locator: Locator) => locator.getByTestId('e2eSingleFileUploadTable');
        const getMultipleFileUploadTable = (locator: Locator) => locator.getByTestId('e2eMultipleFileUploadTable');

        test('KbqSingleFileUploadComponent states', async ({ page }) => {
            await page.goto('/E2eFileUploadStateAndStyle');
            await page.setViewportSize({ width: 1400, height: 320 });

            const locator = getComponent(page);

            const screenshotTarget = getSingleFileUploadTable(locator);

            await expect(screenshotTarget).toHaveScreenshot('01-light.png');
            await e2eEnableDarkTheme(page);
            await expect(screenshotTarget).toHaveScreenshot('01-dark.png');
        });

        test('KbqMultipleFileUploadComponent states', async ({ page }) => {
            await page.goto('/E2eFileUploadStateAndStyle');
            const locator = getComponent(page);

            await page.setViewportSize({ width: 1400, height: 900 });

            const screenshotTarget = getMultipleFileUploadTable(locator);

            await expect(screenshotTarget).toHaveScreenshot('02-light.png');
            await e2eEnableDarkTheme(page);
            await expect(screenshotTarget).toHaveScreenshot('02-dark.png');
        });
    });

    test.describe('KbqDropzoneStyle', () => {
        const getComponent = (page: Page) => page.getByTestId('e2eDropzone');
        const getLocalDropzoneArea = (locator: Locator) => locator.getByTestId('e2eLocalDropzoneArea');
        const clickLocalDropzoneTrigger = (locator: Locator) => locator.getByTestId('e2eLocalDropzoneTrigger').click();
        const clickFullScreenDropzoneTrigger = (locator: Locator) =>
            locator.getByTestId('e2eFullScreenDropzoneTrigger').click();

        test('KbqLocalDropzone states', async ({ page }) => {
            await page.goto('/E2eDropzone');
            const locator = getComponent(page);

            await clickLocalDropzoneTrigger(locator);

            const screenshotTarget = getLocalDropzoneArea(locator);

            await expect(screenshotTarget).toHaveScreenshot('03-light.png');
            await e2eEnableDarkTheme(page);
            await expect(screenshotTarget).toHaveScreenshot('03-dark.png');
        });

        test('KbqFullScreenDropzone states', async ({ page }) => {
            await page.setViewportSize({ width: 300, height: 300 });

            await page.goto('/E2eDropzone');
            const locator = getComponent(page);

            await clickFullScreenDropzoneTrigger(locator);

            const screenshotTarget = page;

            await expect(screenshotTarget).toHaveScreenshot('04-light.png');
            await e2eEnableDarkTheme(page);
            await expect(screenshotTarget).toHaveScreenshot('04-dark.png');
        });
    });
});
