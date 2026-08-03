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

    test.describe('E2eFilterBarPanelMaxHeight', () => {
        /** Reads a resolved CSS length off the first element matching the selector. */
        const computed = (page: Page, selector: string, property: string): Promise<string> =>
            page.evaluate(
                ({ selector, property }) =>
                    getComputedStyle(document.querySelector<HTMLElement>(selector)!).getPropertyValue(property),
                { selector, property }
            );

        /** Whether the scrollable list overflows, i.e. whether the user gets a scrollbar. */
        const scrolls = (page: Page, selector: string): Promise<boolean> =>
            page.evaluate((selector) => {
                const element = document.querySelector<HTMLElement>(selector)!;

                return element.scrollHeight > element.clientHeight;
            }, selector);

        /**
         * Opens one pipe's panel and returns its scrollable list. The panel carries the token; `__content`
         * is the descendant that has to end up reading it.
         */
        const openPipe = async (page: Page, pipeLocator: Locator, contentSelector: string) => {
            await pipeLocator.locator('.kbq-select__trigger').click();

            const selector = `.cdk-overlay-pane ${contentSelector}`;

            await page.locator(selector).waitFor();

            return selector;
        };

        const openPipeByClass = async (page: Page, pipeClass: string, contentSelector: string) => {
            await page.goto('/E2eFilterBarPanelMaxHeight');

            return openPipe(page, page.locator(pipeClass), contentSelector);
        };

        test('should keep the 256px default when the pipe template omits panelMaxHeight', async ({ page }) => {
            await page.goto('/E2eFilterBarPanelMaxHeight');

            const selector = await openPipe(page, page.locator('.kbq-pipe__select').first(), '.kbq-select__content');

            expect(await computed(page, selector, 'max-height')).toBe('256px');
        });

        test('should not scroll a list of eight options at the default height', async ({ page }) => {
            await page.goto('/E2eFilterBarPanelMaxHeight');

            // The design default is 256px == eight 32px options. The list is a content-box, so its own 4px
            // padding is added on top of the cap instead of eating into it — otherwise only 7.75 options
            // would fit and a full list of eight would scroll behind a clipped row.
            const selector = await openPipe(page, page.locator('.kbq-pipe__select').first(), '.kbq-select__content');

            expect(await scrolls(page, selector)).toBe(false);
        });

        test('should scroll once a list exceeds the default height', async ({ page }) => {
            await page.goto('/E2eFilterBarPanelMaxHeight');

            const selector = await openPipe(page, page.locator('.kbq-pipe__select').nth(1), '.kbq-select__content');

            expect(await computed(page, selector, 'max-height')).toBe('256px');
            expect(await scrolls(page, selector)).toBe(true);
        });

        test('should apply panelMaxHeight from the pipe template to a select pipe', async ({ page }) => {
            expect(
                await computed(
                    page,
                    await openPipeByClass(page, '.kbq-pipe__multiselect', '.kbq-select__content'),
                    'max-height'
                )
            ).toBe('192px');
        });

        test('should apply panelMaxHeight from the pipe template to a tree-select pipe', async ({ page }) => {
            expect(
                await computed(
                    page,
                    await openPipeByClass(page, '.kbq-pipe__tree-select', '.kbq-tree-select__content'),
                    'max-height'
                )
            ).toBe('128px');
        });

        test('should keep the 256px default for a multi-tree-select pipe', async ({ page }) => {
            // `kbq-tree-select` renders `.kbq-tree-select__content`, so a filter-bar rule aimed at
            // `.kbq-select__content` never matched this panel. Both now resolve through the same token.
            expect(
                await computed(
                    page,
                    await openPipeByClass(page, '.kbq-pipe__multi-tree-select', '.kbq-tree-select__content'),
                    'max-height'
                )
            ).toBe('256px');
        });
    });
});
