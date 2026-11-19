import { expect, Locator, Page, test } from '@playwright/test';
import { e2eEnableDarkTheme } from '../../e2e/utils';

test.describe('KbqSplitButtonModule', () => {
    test.describe('E2eSplitButtonStateAndStyle', () => {
        const getComponent = (page: Page) => page.getByTestId('e2eSplitButtonStateAndStyle');
        const togglePrefix = (locator: Locator) => locator.getByTestId('e2eShowPrefixIcon').click();
        const toggleTitle = (locator: Locator) => locator.getByTestId('e2eShowTitle').click();
        const getScreenshotTarget = (locator: Locator) => locator.getByTestId('e2eScreenshotTarget');

        test('with title', async ({ page }) => {
            await page.goto('/E2eSplitButtonStateAndStyle');
            const locator = getComponent(page);

            await expect(getScreenshotTarget(locator)).toHaveScreenshot('01-light.png');
        });

        test('with icon', async ({ page }) => {
            await page.goto('/E2eSplitButtonStateAndStyle');
            const locator = getComponent(page);

            await togglePrefix(locator);
            await toggleTitle(locator);

            await expect(getScreenshotTarget(locator)).toHaveScreenshot('02-light.png');
        });

        test('with title, prefix and suffix', async ({ page }) => {
            await page.goto('/E2eSplitButtonStateAndStyle');
            const locator = getComponent(page);

            await togglePrefix(locator);

            await expect(getScreenshotTarget(locator)).toHaveScreenshot('03-light.png');
            await e2eEnableDarkTheme(page);
            await expect(getScreenshotTarget(locator)).toHaveScreenshot('03-dark.png');
        });
    });

    test.describe('E2eSplitButtonTruncation', () => {
        const getFirstButtonText = (splitButton: Locator) =>
            splitButton.locator('.kbq-split-button_first .kbq-button-text');

        for (const testId of ['e2eSplitButtonTruncationNoIcon', 'e2eSplitButtonTruncationPrefixIcon']) {
            test(`clips the leading button's label of ${testId}`, async ({ page }) => {
                await page.goto('/E2eSplitButtonTruncation');

                const widths = await getFirstButtonText(page.getByTestId(testId)).evaluate((element) => ({
                    scroll: element.scrollWidth,
                    client: element.clientWidth
                }));

                expect(widths.scroll).toBeGreaterThan(widths.client);
            });

            test(`keeps the leading button's label a block container in ${testId}`, async ({ page }) => {
                await page.goto('/E2eSplitButtonTruncation');

                // `.kbq-button-text` is a flex item of `.kbq-button-wrapper`, so its computed display
                // for the non-icon-in-default-slot case is blockified from `inline-block` to `block`
                // (never `flex`, which would stop `text-overflow: ellipsis` from painting).
                await expect(getFirstButtonText(page.getByTestId(testId))).toHaveCSS('display', 'block');
            });
        }

        test('renders the ellipsis', async ({ page }) => {
            await page.goto('/E2eSplitButtonTruncation');

            const screenshotTarget = page.getByTestId('e2eSplitButtonTruncation').getByTestId('e2eScreenshotTarget');

            await expect(screenshotTarget).toHaveScreenshot('04-light.png');
            await e2eEnableDarkTheme(page);
            await expect(screenshotTarget).toHaveScreenshot('04-dark.png');
        });
    });
});
