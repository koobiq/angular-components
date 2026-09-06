import { expect, Locator, Page, test } from '@playwright/test';
import { e2eEnableDarkTheme } from '../../e2e/utils';

test.describe('KbqFileUploadModule', () => {
    test.describe('E2eFileUploadStateAndStyle', () => {
        const getComponent = (page: Page) => page.getByTestId('e2eFileUploadStateAndStyle');
        const getSingleFileUploadTable = (locator: Locator) => locator.getByTestId('e2eSingleFileUploadTable');
        const getMultipleFileUploadTable = (locator: Locator) => locator.getByTestId('e2eMultipleFileUploadTable');
        const getProgressTable = (locator: Locator) => locator.getByTestId('e2eFileUploadProgressTable');

        /**
         * The hover and focus states in these tables are painted on by the fixture after the first
         * render, and the single-file ones are re-applied in a macrotask after the component's focus
         * monitor clears them. `goto` resolving says nothing about either.
         *
         * Waits on the marker the fixture sets last rather than on a count of undecorated elements:
         * that count is zero before the classes are applied at all, and again in the window after the
         * focus monitor has cleared them, so it cannot tell any of the three states apart.
         */
        const expectFixtureDecorated = (page: Page) =>
            expect(getComponent(page)).toHaveAttribute('data-e2e-decorated', '');

        test('KbqSingleFileUploadComponent states', async ({ page }) => {
            await page.goto('/E2eFileUploadStateAndStyle');
            await page.setViewportSize({ width: 1400, height: 320 });

            const locator = getComponent(page);

            const screenshotTarget = getSingleFileUploadTable(locator);

            await expectFixtureDecorated(page);

            await expect(screenshotTarget).toHaveScreenshot('01-light.png');
            await e2eEnableDarkTheme(page);
            await expect(screenshotTarget).toHaveScreenshot('01-dark.png');
        });

        test('KbqMultipleFileUploadComponent states', async ({ page }) => {
            await page.goto('/E2eFileUploadStateAndStyle');
            const locator = getComponent(page);

            await page.setViewportSize({ width: 1400, height: 900 });

            const screenshotTarget = getMultipleFileUploadTable(locator);

            await expectFixtureDecorated(page);

            await expect(screenshotTarget).toHaveScreenshot('02-light.png');
            await e2eEnableDarkTheme(page);
            await expect(screenshotTarget).toHaveScreenshot('02-dark.png');
        });

        /**
         * `scrollWidth <= clientWidth` on the container is what the fix is about, but on its own it also
         * passes on a name that was never rendered — and `scrollWidth > clientWidth` on the start element
         * passes on an unsplit name sitting there whole. What the split promises is that the tail survives
         * intact, so the extension is asserted as well.
         */
        const expectNameSplitWithoutOverflow = async (item: Locator, container: Locator) => {
            // `KbqEllipsisCenterDirective` splits the text in a macrotask, so the layout only settles a frame
            // after the component itself is attached.
            await expect.poll(() => container.evaluate((el) => el.scrollWidth <= el.clientWidth)).toBe(true);

            const start = item.locator('.kbq-ellipsis-center_data-text-start');
            const end = item.locator('.kbq-ellipsis-center_data-text-end');

            await expect.poll(() => start.evaluate((el) => el.scrollWidth > el.clientWidth)).toBe(true);
            await expect(end).toHaveText(/\.pdf$/);
            await expect.poll(() => end.evaluate((el) => el.scrollWidth <= el.clientWidth)).toBe(true);
        };

        test('KbqMultipleFileUploadComponent truncates a long file name without horizontal scroll', async ({
            page
        }) => {
            await page.goto('/E2eFileUploadStateAndStyle');

            const item = getComponent(page).getByTestId('e2eMultipleFileUploadLongName');

            await expectNameSplitWithoutOverflow(item, item.locator('.kbq-file-upload__list'));
        });

        test('KbqSingleFileUploadComponent truncates a long file name without horizontal scroll', async ({ page }) => {
            await page.goto('/E2eFileUploadStateAndStyle');

            const item = getComponent(page).getByTestId('e2eSingleFileUploadLongName');

            await expectNameSplitWithoutOverflow(item, item.locator('.kbq-file-item'));

            // The assertions above prove the row fits and the truncation works survived.
            // The screenshot below shows the result.
            await expect(item).toHaveScreenshot('05-light.png');
        });

        test('KbqMultipleFileUploadComponent re-splits the name when only the container resizes', async ({ page }) => {
            await page.goto('/E2eFileUploadStateAndStyle');

            const item = getComponent(page).getByTestId('e2eMultipleFileUploadLongName');
            const end = item.locator('.kbq-ellipsis-center_data-text-end');

            await expect(end).toHaveText(/\.pdf$/);

            const tailWhenNarrow = await end.innerText();

            // The window keeps its size here. A splitter drag, a collapsing sidebar, or the list's own
            // vertical scrollbar appearing all change the row's width and nothing else — which is exactly
            // what a `window:resize` listener cannot see.
            await item.evaluate((element: HTMLElement) => (element.style.width = '640px'));

            await expect.poll(() => end.innerText()).not.toBe(tailWhenNarrow);
            await expect(end).toHaveText(/\.pdf$/);
        });

        test('progress and focused browse link states', async ({ page }) => {
            await page.goto('/E2eFileUploadStateAndStyle');
            await page.setViewportSize({ width: 1400, height: 500 });

            const locator = getComponent(page);

            const screenshotTarget = getProgressTable(locator);

            await expectFixtureDecorated(page);

            await expect(screenshotTarget).toHaveScreenshot('06-light.png');
            await e2eEnableDarkTheme(page);
            await expect(screenshotTarget).toHaveScreenshot('06-dark.png');
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
