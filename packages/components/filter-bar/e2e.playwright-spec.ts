import { expect, Locator, Page, test } from '@playwright/test';
import { e2eEnableDarkTheme } from '../../e2e/utils';

test.describe('KbqFilterBarModule', () => {
    test.describe('E2eFilterBarStates', () => {
        const getComponent = (page: Page) => page.getByTestId('e2eFilterBarStates');
        const getScreenshotTarget = (locator: Locator) => locator.getByTestId('e2eScreenshotTarget');

        test('states', async ({ page }) => {
            await page.goto('/E2eFilterBarStates');
            const locator = getComponent(page);

            await expect(getScreenshotTarget(locator)).toHaveScreenshot('01-light.png');
            await e2eEnableDarkTheme(page);
            await expect(getScreenshotTarget(locator)).toHaveScreenshot('01-dark.png');
        });
    });

    test.describe('E2eFilterBarPipeTruncation', () => {
        const getComponent = (page: Page) => page.getByTestId('e2eFilterBarPipeTruncation');

        /** An inline box reports a client width of 0 and never clips its own content. */
        const getWidths = (locator: Locator) =>
            locator.evaluate((element) => ({ scroll: element.scrollWidth, client: element.clientWidth }));

        test('truncates the pipe name and value independently', async ({ page }) => {
            await page.goto('/E2eFilterBarPipeTruncation');

            const pipe = getComponent(page).locator('.kbq-pipe').first();
            const value = pipe.locator('.kbq-pipe__value');

            for (const part of [pipe.locator('.kbq-pipe__name'), value]) {
                const widths = await getWidths(part);

                // Both parts must stay block-level flex items inside `.kbq-button-text`, otherwise
                // their own ellipsis does not apply and a single one eats the whole width budget.
                expect(widths.client).toBeGreaterThan(0);
                expect(widths.scroll).toBeGreaterThan(widths.client);
            }

            const pipeBox = (await pipe.boundingBox())!;
            const valueBox = (await value.boundingBox())!;

            expect(valueBox.x + valueBox.width).toBeLessThanOrEqual(pipeBox.x + pipeBox.width + 1);
        });

        test('truncates the saved filter name', async ({ page }) => {
            await page.goto('/E2eFilterBarPipeTruncation');

            const widths = await getWidths(getComponent(page).locator('.kbq-filters__filter-name'));

            expect(widths.client).toBeGreaterThan(0);
            expect(widths.scroll).toBeGreaterThan(widths.client);
        });
    });

    test.describe('E2eFilterBarFilters', () => {
        const getComponent = (page: Page) => page.getByTestId('e2eFilterBarFilters');
        const getScreenshotTarget = (locator: Locator) => locator.getByTestId('e2eScreenshotTarget');

        test('states', async ({ page }) => {
            await page.goto('/E2eFilterBarFilters');
            const locator = getComponent(page);

            await expect(getScreenshotTarget(locator)).toHaveScreenshot('02-filters-light.png');
            await e2eEnableDarkTheme(page);
            await expect(getScreenshotTarget(locator)).toHaveScreenshot('02-filters-dark.png');
        });
    });
});
