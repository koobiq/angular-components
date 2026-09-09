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

    test.describe('E2eFilterBarOptionCaption', () => {
        const getComponent = (page: Page) => page.getByTestId('e2eFilterBarOptionCaption');
        const getScreenshotTarget = (locator: Locator) => locator.getByTestId('e2eScreenshotTarget');

        /** The `multiselect` pipes of the scenario, in template order: [0] plain, [1] `multilineOptions`. */
        const TRUNCATED = 0;
        const MULTILINE = 1;

        /**
         * Opens one `multiselect` pipe's panel and returns the locator of its first option — the long
         * captioned one. Navigates first, so each call starts from a page with no panel open.
         */
        const openPipe = async (page: Page, index: number) => {
            await page.goto('/E2eFilterBarOptionCaption');
            await page.locator('.kbq-pipe__multiselect').nth(index).locator('.kbq-select__trigger').click();

            const option = page.locator('.cdk-overlay-pane .kbq-option').first();

            await option.waitFor();

            return option;
        };

        /** Reads a resolved CSS property off an element. */
        const computed = (locator: Locator, property: string): Promise<string> =>
            locator.evaluate((element, property) => getComputedStyle(element).getPropertyValue(property), property);

        /**
         * Horizontal overflow of the option's name line. Measured on the line rather than on
         * `.kbq-option-text`, because a two-line option gives each line its own clipping box — so the
         * overflow never reaches the wrapper's `scrollWidth`.
         */
        const getNameWidths = (option: Locator) =>
            option
                .locator('.kbq-option-text > *')
                .first()
                .evaluate((element) => ({
                    scroll: element.scrollWidth,
                    client: element.clientWidth
                }));

        test('should wrap the option text only under multilineOptions', async ({ page }) => {
            const truncated = await openPipe(page, TRUNCATED);

            expect(await computed(truncated.locator('.kbq-option-text'), 'white-space')).toBe('nowrap');

            const multiline = await openPipe(page, MULTILINE);

            // The panel is portaled into the overlay, so this also proves the pipe's `panelClass`
            // modifier actually reaches it.
            expect(await computed(multiline.locator('.kbq-option-text'), 'white-space')).toBe('normal');
        });

        test('should truncate the long option with an ellipsis without multilineOptions', async ({ page }) => {
            const option = await openPipe(page, TRUNCATED);
            const name = option.locator('.kbq-option-text > *').first();
            const { scroll, client } = await getNameWidths(option);

            // The panel is content-sized, so it first grows to `--kbq-panel-size-width-max`; only past
            // that cap does the option text start being clipped. The fixture name is long enough to
            // reach it — otherwise this would pass on a panel that simply widened instead.
            expect(client).toBeGreaterThan(0);
            expect(scroll).toBeGreaterThan(client);

            // The line has to clip itself, or the clipped text gets no `…`.
            expect(await computed(name, 'overflow-x')).toBe('hidden');
            expect(await computed(name, 'text-overflow')).toBe('ellipsis');
        });

        test('should wrap the long option under multilineOptions instead of clipping it', async ({ page }) => {
            const option = await openPipe(page, MULTILINE);
            const { scroll, client } = await getNameWidths(option);

            // Nothing overflows horizontally any more, and the wrapped rows make the option taller than
            // the 48px a single-line name over a single-line caption occupies.
            expect(scroll).toBeLessThanOrEqual(client);
            expect((await option.boundingBox())!.height).toBeGreaterThan(48);
        });

        test('should show the truncation tooltip on a clipped two-line option', async ({ page }) => {
            const option = await openPipe(page, TRUNCATED);

            await option.hover();

            // `KbqOptionTooltip` measures the option's text element, which a self-clipping line no longer
            // overflows — without its line-aware check the hint never appears for a captioned option.
            const tooltip = page.locator('.kbq-tooltip__content');

            await expect(tooltip).toBeVisible();
            // The caption is not part of the hint: it comes from `viewValue`, not the host's textContent.
            await expect(tooltip).toHaveText(
                'Warning: additional information about the event that is far too long to be shown on a single line of the dropdown panel'
            );
        });

        test('should render the caption at the compact size', async ({ page }) => {
            const option = await openPipe(page, MULTILINE);

            // The caption is a secondary line: `text-compact`, not the option's own `text-normal`.
            expect(await computed(option.locator('.kbq-option-caption'), 'font-size')).toBe('12px');
        });

        test('states', async ({ page }) => {
            await openPipe(page, MULTILINE);
            const locator = getScreenshotTarget(getComponent(page));

            await expect(locator).toHaveScreenshot('03-option-caption-light.png');
            await e2eEnableDarkTheme(page);
            await expect(locator).toHaveScreenshot('03-option-caption-dark.png');
        });
    });
});
