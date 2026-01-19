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
});
