import { expect, Locator, Page, test } from '@playwright/test';
import { e2eEnableDarkTheme } from '../../e2e/utils';

test.describe('KbqFileUploadModule', () => {
    test.describe('E2eFileUploadStateAndStyle', () => {
        const getComponent = (page: Page) => page.getByTestId('e2eFileUploadStateAndStyle');
        const getSingleFileUploadTable = (locator: Locator) => locator.getByTestId('e2eSingleFileUploadTable');
        const getMultipleFileUploadTable = (locator: Locator) => locator.getByTestId('e2eMultipleFileUploadTable');

        /**
         * The hover and focus states in these tables are painted on by the fixture after the first
         * render, and the single-file one is re-applied in a macrotask after the component clears it.
         * `goto` resolving says nothing about either, so a shot taken without this shows no focus ring.
         */
        const expectFixtureDecorated = async (table: Locator) => {
            await expect(table.locator('.dev-hover .kbq-file-upload__item:not(.kbq-hovered)')).toHaveCount(0);
            await expect(table.locator('.dev-focused .kbq-file-upload__action:not(.cdk-keyboard-focused)')).toHaveCount(
                0
            );
        };

        test('KbqSingleFileUploadComponent states', async ({ page }) => {
            await page.goto('/E2eFileUploadStateAndStyle');
            await page.setViewportSize({ width: 1400, height: 320 });

            const locator = getComponent(page);

            const screenshotTarget = getSingleFileUploadTable(locator);

            await expectFixtureDecorated(screenshotTarget);

            await expect(screenshotTarget).toHaveScreenshot('01-light.png');
            await e2eEnableDarkTheme(page);
            await expect(screenshotTarget).toHaveScreenshot('01-dark.png');
        });

        test('KbqMultipleFileUploadComponent states', async ({ page }) => {
            await page.goto('/E2eFileUploadStateAndStyle');
            const locator = getComponent(page);

            await page.setViewportSize({ width: 1400, height: 900 });

            const screenshotTarget = getMultipleFileUploadTable(locator);

            await expectFixtureDecorated(screenshotTarget);

            await expect(screenshotTarget).toHaveScreenshot('02-light.png');
            await e2eEnableDarkTheme(page);
            await expect(screenshotTarget).toHaveScreenshot('02-dark.png');
        });
    });

    test.describe('KbqDropzone', () => {
        const getComponent = (page: Page) => page.getByTestId('e2eFileUploadDropzone');
        const getLocalDropzoneArea = (locator: Locator) => locator.getByTestId('e2eLocalDropzoneArea');
        const clickLocalDropzoneTrigger = (locator: Locator) => locator.getByTestId('e2eLocalDropzoneTrigger').click();
        const clickFullScreenDropzoneTrigger = (locator: Locator) =>
            locator.getByTestId('e2eFullScreenDropzoneTrigger').click();
        const hideTrigger = (page: Page) =>
            page.addStyleTag({
                content: `
                  .e2e-dropzone-trigger { display: none; }
                `
            });

        test('KbqLocalDropzone states', async ({ page }) => {
            await page.goto('/E2eFileUploadDropzone');
            const locator = getComponent(page);

            await clickLocalDropzoneTrigger(locator);

            const screenshotTarget = getLocalDropzoneArea(locator);

            await expect(screenshotTarget).toHaveScreenshot('03-light.png');
            await e2eEnableDarkTheme(page);
            await expect(screenshotTarget).toHaveScreenshot('03-dark.png');
        });

        test('KbqFullScreenDropzone states', async ({ page }) => {
            await page.setViewportSize({ width: 300, height: 300 });

            await page.goto('/E2eFileUploadDropzone');
            const locator = getComponent(page);

            await clickFullScreenDropzoneTrigger(locator);

            const screenshotTarget = page;

            await hideTrigger(page);

            await expect(screenshotTarget).toHaveScreenshot('04-light.png');
            await e2eEnableDarkTheme(page);
            await expect(screenshotTarget).toHaveScreenshot('04-dark.png');
        });
    });
});
