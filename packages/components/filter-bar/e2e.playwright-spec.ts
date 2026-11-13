import { expect, type Locator, type Page, test } from '@playwright/test';
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

            const pipe = getComponent(page).locator('.kbq-pipe__text');
            const value = pipe.locator('.kbq-pipe__value');

            for (const part of [pipe.locator('.kbq-pipe__name'), value]) {
                const widths = await getWidths(part);

                // Both parts must stay block-level items of the grid inside `.kbq-button-text`, otherwise
                // their own ellipsis does not apply and a single one eats the whole width budget.
                expect(widths.client).toBeGreaterThan(0);
                expect(widths.scroll).toBeGreaterThan(widths.client);
            }

            const pipeBox = (await pipe.boundingBox())!;
            const valueBox = (await value.boundingBox())!;

            expect(valueBox.x + valueBox.width).toBeLessThanOrEqual(pipeBox.x + pipeBox.width + 1);
        });

        test('splits the width evenly when both parts are too long', async ({ page }) => {
            await page.goto('/E2eFilterBarPipeTruncation');

            const pipe = getComponent(page).locator('.kbq-pipe__text');
            const name = await getWidths(pipe.locator('.kbq-pipe__name'));
            const value = await getWidths(pipe.locator('.kbq-pipe__value'));

            // Two shrinkable `max-content` tracks get an equal share of what is left; the value's 4px
            // inline margin is the only asymmetry. As flex items each kept the same *percentage* of its
            // own text instead, which is what starved the shorter part.
            expect(Math.abs(name.client - value.client)).toBeLessThanOrEqual(8);
        });

        test('keeps a short name at full width next to a long value', async ({ page }) => {
            await page.goto('/E2eFilterBarPipeTruncation');

            const pipe = getComponent(page).locator('.kbq-pipe__multiselect');
            const name = await getWidths(pipe.locator('.kbq-pipe__name'));
            const value = await getWidths(pipe.locator('.kbq-pipe__value'));

            // The name asks for less than its share, so it keeps all of it and the value takes the rest.
            expect(name.client).toBeGreaterThan(0);
            expect(name.scroll).toBeLessThanOrEqual(name.client);
            expect(value.scroll).toBeGreaterThan(value.client);
        });

        test('shows the tooltip when the neighbour clips a part that would fit on its own', async ({ page }) => {
            await page.goto('/E2eFilterBarPipeTruncation');

            const pipe = getComponent(page).locator('.kbq-pipe__text');
            const trigger = pipe.locator(':scope > .kbq-button');
            const container = await trigger
                .locator('.kbq-button-wrapper')
                .evaluate((element: HTMLElement) => element.offsetWidth);

            for (const part of [pipe.locator('.kbq-pipe__name'), pipe.locator('.kbq-pipe__value')]) {
                const widths = await getWidths(part);

                // Clipped, yet its full text fits the container: only the part's own box shows the truncation.
                expect(widths.scroll).toBeGreaterThan(widths.client);
                expect(widths.scroll).toBeLessThan(container);
            }

            await trigger.hover();

            await expect(page.locator('.kbq-tooltip')).toBeVisible();
            await expect(page.locator('.kbq-tooltip')).toContainText('и не менее длинное значение фильтра');
        });

        test('caps every pipe but the input one at --kbq-filter-bar-pipe-max-width', async ({ page }) => {
            await page.goto('/E2eFilterBarPipeTruncation');

            const component = getComponent(page);

            // Not the 320px fallback, so the check proves that the token drives the cap.
            await component
                .locator('kbq-filter-bar')
                .evaluate((bar) => bar.style.setProperty('--kbq-filter-bar-pipe-max-width', '200px'));

            await expect(component.locator('.kbq-pipe__multiselect .kbq-pipe-button')).toHaveCount(1);

            const pipes = await component.locator('.kbq-pipe:not(.kbq-pipe__input)').all();

            expect(pipes.length).toBeGreaterThan(0);

            for (const pipe of pipes) {
                const pipeBox = (await pipe.boundingBox())!;
                // The remove button of a removable pipe has to fit inside the cap too.
                const lastBox = (await pipe.locator(':scope > :last-child').boundingBox())!;

                expect(pipeBox.width).toBeLessThanOrEqual(200);
                expect(lastBox.x + lastBox.width).toBeLessThanOrEqual(pipeBox.x + pipeBox.width + 1);
            }

            // Read once, past the caps above: the input pipe is 240px wide without the token too.
            const inputBox = (await component.locator('.kbq-pipe__input').boundingBox())!;

            expect(inputBox.width).toBe(240);
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

            await expect(page.locator(selector)).toHaveCSS('max-height', '256px');
        });

        test('should not scroll a list of eight options at the default height', async ({ page }) => {
            await page.goto('/E2eFilterBarPanelMaxHeight');

            // The design default is 256px == eight 32px options. The list is a content-box, so its own 4px
            // padding is added on top of the cap instead of eating into it — otherwise only 7.75 options
            // would fit and a full list of eight would scroll behind a clipped row.
            const selector = await openPipe(page, page.locator('.kbq-pipe__select').first(), '.kbq-select__content');

            // Read once, after all eight options are in: an empty list does not scroll either.
            await expect(page.locator(`${selector} .kbq-option`)).toHaveCount(8);
            const overflows = await scrolls(page, selector);

            expect(overflows).toBe(false);
        });

        test('should scroll once a list exceeds the default height', async ({ page }) => {
            await page.goto('/E2eFilterBarPanelMaxHeight');

            const selector = await openPipe(page, page.locator('.kbq-pipe__select').nth(1), '.kbq-select__content');

            await expect(page.locator(selector)).toHaveCSS('max-height', '256px');
            await expect.poll(() => scrolls(page, selector)).toBe(true);
        });

        test('should apply panelMaxHeight from the pipe template to a select pipe', async ({ page }) => {
            const selector = await openPipeByClass(page, '.kbq-pipe__multiselect', '.kbq-select__content');

            await expect(page.locator(selector)).toHaveCSS('max-height', '192px');
        });

        test('should apply panelMaxHeight from the pipe template to a tree-select pipe', async ({ page }) => {
            const selector = await openPipeByClass(page, '.kbq-pipe__tree-select', '.kbq-tree-select__content');

            await expect(page.locator(selector)).toHaveCSS('max-height', '128px');
        });

        test('should keep the 256px default for a multi-tree-select pipe', async ({ page }) => {
            // `kbq-tree-select` renders `.kbq-tree-select__content`, so a filter-bar rule aimed at
            // `.kbq-select__content` never matched this panel. Both now resolve through the same token.
            const selector = await openPipeByClass(page, '.kbq-pipe__multi-tree-select', '.kbq-tree-select__content');

            await expect(page.locator(selector)).toHaveCSS('max-height', '256px');
        });
    });

    test.describe('E2eFilterBarOptionCaption', () => {
        const getComponent = (page: Page) => page.getByTestId('e2eFilterBarOptionCaption');
        const getScreenshotTarget = (locator: Locator) => locator.getByTestId('e2eScreenshotTarget');

        /** The `multiselect` pipes of the scenario, in template order: [0] plain, [1] `multilineOptions`. */
        const TRUNCATED = 0;
        const MULTILINE = 1;

        /** Opens one `multiselect` pipe and returns its first option — the long captioned one. */
        const openPipe = async (page: Page, index: number) => {
            await page.goto('/E2eFilterBarOptionCaption');
            await page.locator('.kbq-pipe__multiselect').nth(index).locator('.kbq-select__trigger').click();

            const option = page.locator('.cdk-overlay-pane .kbq-option').first();

            await option.waitFor();

            return option;
        };

        /** Opens a tree pipe and returns its long captioned leaf below the branch. */
        const openTreePipe = async (page: Page, selector: string, index: number = 0) => {
            await page.goto('/E2eFilterBarOptionCaption');
            await page.locator(selector).nth(index).locator('.kbq-select__trigger').click();

            const option = page.locator('.cdk-overlay-pane .kbq-tree-option').nth(1);

            await option.waitFor();

            return option;
        };

        /** Overflow of the name line: a two-line option gives each line its own clipping box. */
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

            await expect(truncated.locator('.kbq-option-text')).toHaveCSS('white-space', 'nowrap');

            const multiline = await openPipe(page, MULTILINE);

            // The panel is portaled into the overlay, so this also proves the `panelClass` modifier reaches it.
            await expect(multiline.locator('.kbq-option-text')).toHaveCSS('white-space', 'normal');
        });

        test('should truncate the long option with an ellipsis without multilineOptions', async ({ page }) => {
            const option = await openPipe(page, TRUNCATED);
            const name = option.locator('.kbq-option-text > *').first();
            const { scroll, client } = await getNameWidths(option);

            expect(client).toBeGreaterThan(0);
            expect(scroll).toBeGreaterThan(client);

            // The line has to clip itself, or the clipped text gets no `…`.
            await expect(name).toHaveCSS('overflow-x', 'hidden');
            await expect(name).toHaveCSS('text-overflow', 'ellipsis');
        });

        test('should wrap the long option under multilineOptions instead of clipping it', async ({ page }) => {
            const option = await openPipe(page, MULTILINE);

            // The wrapped rows make the option taller than 48px, and nothing overflows horizontally once they have.
            await expect.poll(async () => (await option.boundingBox())?.height).toBeGreaterThan(48);

            const { scroll, client } = await getNameWidths(option);

            expect(scroll).toBeLessThanOrEqual(client);
        });

        test('should show the truncation tooltip on a clipped two-line option', async ({ page }) => {
            const option = await openPipe(page, TRUNCATED);

            await option.hover();

            // Without the line-aware check in `KbqOptionTooltip` the hint never appears for this option.
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
            await expect(option.locator('.kbq-option-caption')).toHaveCSS('font-size', '12px');
        });

        test('should caption and wrap tree options according to multilineOptions', async ({ page }) => {
            const truncated = await openTreePipe(page, '.kbq-pipe__tree-select');

            await expect(truncated.locator('.kbq-option-caption')).toHaveText(
                'A caption long enough to need a second line of its own once the panel stops growing'
            );
            await expect(truncated.locator('.kbq-option-text')).toHaveCSS('white-space', 'nowrap');

            const { scroll, client } = await getNameWidths(truncated);

            expect(scroll).toBeGreaterThan(client);

            const multiline = await openTreePipe(page, '.kbq-pipe__multi-tree-select');

            await expect(multiline.locator('.kbq-option-text')).toHaveCSS('white-space', 'normal');
        });

        test('should render a custom tree option and keep its caption out of the trigger', async ({ page }) => {
            const option = await openTreePipe(page, '.kbq-pipe__tree-select', 1);
            const name =
                'Warning: additional information about the event that is far too long to be shown on a single line of the dropdown panel';

            await expect(option.locator('.e2e-custom-tree-option')).toHaveText(name);

            await option.click();

            const triggerValue = page.locator('.kbq-pipe__tree-select').nth(1).locator('.kbq-pipe__value');

            await expect(triggerValue).toHaveText(name);
        });

        test('states', async ({ page }) => {
            await openPipe(page, MULTILINE);
            const locator = getScreenshotTarget(getComponent(page));

            await expect(locator).toHaveScreenshot('03-option-caption-light.png');
            await e2eEnableDarkTheme(page);
            await expect(locator).toHaveScreenshot('03-option-caption-dark.png');
        });
    });

    test.describe('E2eFilterBarPipeFill', () => {
        const getComponent = (page: Page) => page.getByTestId('e2eFilterBarPipeFill');
        const getScreenshotTarget = (locator: Locator) => locator.getByTestId('e2eScreenshotTarget');

        /** Trigger and clear button of the pipe at the given index — the two halves of one control. */
        const getHalves = (page: Page, index: number) => {
            const pipe = getComponent(page).locator('.kbq-pipe').nth(index);

            return {
                trigger: pipe.locator('button:not(.kbq-pipe__remove-button)'),
                clear: pipe.locator('.kbq-pipe__remove-button')
            };
        };

        /**
         * Closes an open panel with a click clear of the bar but still inside <body> — CDK listens for the
         * outside pointer events on body itself, and a click below it reaches only <html>. Not Escape: a
         * keypress moves the input modality to `keyboard` and the trigger takes the focus ring back with it.
         *
         * Asserts the close, so a mis-aimed click fails here instead of silently leaving the pipe active in
         * a screenshot.
         */
        const closePanel = async (page: Page) => {
            await page.mouse.click(1000, 150);
            await expect(page.locator('.cdk-overlay-pane')).toHaveCount(0);
        };

        const pickOption = async (page: Page, name: string) => {
            await page.locator('.cdk-overlay-pane .kbq-option', { hasText: name }).click();
            await closePanel(page);
        };

        test('should fill both halves of a pipe that receives a value after initialization', async ({ page }) => {
            await page.goto('/E2eFilterBarPipeFill');

            const { trigger, clear } = getHalves(page, 1);

            await expect(trigger).toHaveClass(/kbq-button_outline/);
            await expect(clear).toHaveCount(0);

            await trigger.click();
            await pickOption(page, 'Option 2');

            // The clear button exists only once the pipe holds a value, so waiting for it settles the state.
            await expect(clear).toHaveClass(/kbq-button_filled/);
            await expect(trigger).toHaveClass(/kbq-button_filled/);
        });

        test('should outline the trigger of a pipe cleared after initialization', async ({ page }) => {
            await page.goto('/E2eFilterBarPipeFill');

            const { trigger, clear } = getHalves(page, 0);

            await expect(trigger).toHaveClass(/kbq-button_filled/);

            await clear.click();

            await expect(clear).toHaveCount(0);
            await expect(trigger).toHaveClass(/kbq-button_outline/);
        });

        test('should outline both halves of a pipe cleared by its own clear button', async ({ page }) => {
            await page.goto('/E2eFilterBarPipeFill');

            // The persistent pipe is cleanable AND removable, so its clear button empties the pipe and
            // stays mounted: the one place both halves are visible while the pipe is empty.
            const { trigger, clear } = getHalves(page, 2);

            await expect(trigger).toHaveClass(/kbq-button_filled/);
            await expect(clear).toHaveClass(/kbq-button_filled/);

            await clear.click();

            await expect(trigger).toHaveClass(/kbq-button_outline/);
            await expect(clear).toHaveClass(/kbq-button_outline/);
        });

        test('states', async ({ page }) => {
            await page.goto('/E2eFilterBarPipeFill');

            const { trigger, clear } = getHalves(page, 1);

            await trigger.click();
            await pickOption(page, 'Option 2');
            await expect(clear).toHaveClass(/kbq-button_filled/);

            const locator = getScreenshotTarget(getComponent(page));

            await expect(locator).toHaveScreenshot('04-pipe-fill-light.png');
            await e2eEnableDarkTheme(page);
            await expect(locator).toHaveScreenshot('04-pipe-fill-dark.png');
        });
    });

    test.describe('E2eFilterBarNoOptions', () => {
        const getComponent = (page: Page) => page.getByTestId('e2eFilterBarNoOptions');
        const getScreenshotTarget = (locator: Locator) => locator.getByTestId('e2eScreenshotTarget');

        /** Opens the pipe with the given type modifier; `kbq-select` opens an empty list after a delay. */
        const openPipe = async (page: Page, pipeClass: string) => {
            await page.goto('/E2eFilterBarNoOptions');
            await getComponent(page).locator(`.${pipeClass} .kbq-select__trigger`).click();
            await expect(page.locator('.cdk-overlay-pane .kbq-select-no-options')).toBeVisible();
        };

        for (const pipeClass of [
            'kbq-pipe__select',
            'kbq-pipe__multiselect',
            'kbq-pipe__tree-select',
            'kbq-pipe__multi-tree-select'
        ]) {
            test(`should show the message in place of the list of ${pipeClass}`, async ({ page }) => {
                await openPipe(page, pipeClass);

                const panel = page.locator('.cdk-overlay-pane');

                await expect(panel.locator('.kbq-select-no-options')).toHaveText('Нет доступных опций');
                await expect(panel.locator('input')).toHaveCount(0);
                await expect(panel.locator('.kbq-option, .kbq-tree-option')).toHaveCount(0);
            });
        }

        test('states', async ({ page }) => {
            await openPipe(page, 'kbq-pipe__select');

            const locator = getScreenshotTarget(getComponent(page));

            await expect(locator).toHaveScreenshot('05-no-options-light.png');
            await e2eEnableDarkTheme(page);
            await expect(locator).toHaveScreenshot('05-no-options-dark.png');
        });

        test('tree states', async ({ page }) => {
            await openPipe(page, 'kbq-pipe__tree-select');

            const locator = getScreenshotTarget(getComponent(page));

            await expect(locator).toHaveScreenshot('06-no-options-tree-light.png');
            await e2eEnableDarkTheme(page);
            await expect(locator).toHaveScreenshot('06-no-options-tree-dark.png');
        });
    });

    test.describe('E2eFilterBarMultiTreeSelectValueTemplate', () => {
        const getComponent = (page: Page) => page.getByTestId('e2eFilterBarMultiTreeSelectValueTemplate');
        const getScreenshotTarget = (locator: Locator) => locator.getByTestId('e2eScreenshotTarget');

        test('custom node values', async ({ page }) => {
            await page.goto('/E2eFilterBarMultiTreeSelectValueTemplate');

            const component = getComponent(page);
            const trigger = component.locator('.kbq-pipe__multi-tree-select .kbq-select__trigger');

            await trigger.click();

            const panel = page.locator('.kbq-pipe-multi-tree-select__panel_custom-value');
            const options = panel.locator('.kbq-tree-option');
            const longOption = options.filter({ hasText: 'Операционная система' });

            await expect(panel).toBeVisible();
            await expect(panel.locator('.e2e-filter-bar-multi-tree-select-value-template__icon')).toHaveCount(2);
            await expect(panel.locator('kbq-tree-node-toggle')).toHaveCount(2);
            await expect(panel.locator('kbq-pseudo-checkbox').first()).toBeVisible();
            await expect(
                panel.locator('.e2e-filter-bar-multi-tree-select-value-template__count').filter({ hasText: /^0$/ })
            ).toBeVisible();
            await expect(longOption).toBeVisible();

            const longOptionBox = (await longOption.boundingBox())!;
            const longOptionWidth = await longOption.locator('.kbq-option-text').evaluate((element) => ({
                client: element.clientWidth,
                scroll: element.scrollWidth
            }));

            expect(longOptionBox.height).toBeGreaterThan(32);
            expect(longOptionWidth.scroll).toBeLessThanOrEqual(longOptionWidth.client + 1);

            const viewport = page.viewportSize()!;

            await page.mouse.move(viewport.width - 1, viewport.height - 1);

            const screenshotTarget = getScreenshotTarget(component);

            await expect(screenshotTarget).toHaveScreenshot('08-custom-tree-value-light.png');
            await e2eEnableDarkTheme(page);
            await expect(screenshotTarget).toHaveScreenshot('08-custom-tree-value-dark.png');

            const optionText = longOption.locator('.kbq-option-text');
            const multilineToggle = page.getByTestId('e2eMultilineOptionsToggle');

            await expect(optionText).toHaveCSS('white-space', 'normal');
            await multilineToggle.click();
            await trigger.click();
            await expect(optionText).toHaveCSS('white-space', 'nowrap');
            await multilineToggle.click();
            await trigger.click();
            await expect(optionText).toHaveCSS('white-space', 'normal');

            const search = panel.locator('input');

            await search.fill('несовместима');
            await expect(longOption).toBeVisible();
            await expect(longOption.locator('mark')).toHaveText('несовместима');
            await expect(options.filter({ hasText: '4.3.0.269' })).toBeHidden();

            await search.fill('');
            await options.filter({ hasText: '4.3.0.269' }).click();
            await page.keyboard.press('Escape');
            await expect(component.locator('.kbq-pipe__value')).toHaveText('4.3.0.269');
        });
    });

    test.describe('E2eFilterBarDateWithoutValues', () => {
        const getComponent = (page: Page) => page.getByTestId('e2eFilterBarDateWithoutValues');
        const getScreenshotTarget = (locator: Locator) => locator.getByTestId('e2eScreenshotTarget');

        /** Opens the pipe from the keyboard, the path whose focus moves are checked here. */
        const openPipe = async (page: Page) => {
            await page.goto('/E2eFilterBarDateWithoutValues');
            await getComponent(page).locator('.kbq-pipe__date button').first().focus();
            await page.keyboard.press('Enter');

            const panel = page.locator('.kbq-pipe-date__popover');
            const [start, end] = [
                panel.locator('input[formcontrolname="start"]'),
                panel.locator('input[formcontrolname="end"]')
            ];

            await expect(start).toBeFocused();

            return { panel, start, end, calendars: panel.locator('kbq-calendar') };
        };

        test('should open on the period editor and keep Tab out of the calendars', async ({ page }) => {
            const { panel, start, end, calendars } = await openPipe(page);
            const apply = panel.locator('.kbq-date-period__footer button');

            await expect(panel.locator('.kbq-date-period__header')).toHaveCount(0);
            await expect(calendars.first()).toBeVisible();

            // jsdom performs no sequential focus navigation, so only a real browser shows where Tab lands.
            await page.keyboard.press('Tab');
            await expect(end).toBeFocused();
            await expect(calendars.first()).toBeHidden();

            await page.keyboard.press('Tab');
            await expect(apply).toBeFocused();
            await expect(calendars.last()).toBeHidden();

            await page.keyboard.press('Shift+Tab');
            await expect(end).toBeFocused();

            await page.keyboard.press('Shift+Tab');
            await expect(start).toBeFocused();

            // Wraps through the focus trap to the footer: the start calendar does not stay open behind.
            await page.keyboard.press('Shift+Tab');
            await expect(apply).toBeFocused();
            await expect(calendars.first()).toBeHidden();
        });

        test('states', async ({ page }) => {
            const { calendars } = await openPipe(page);

            await expect(calendars.first()).toBeVisible();

            const locator = getScreenshotTarget(getComponent(page));

            await expect(locator).toHaveScreenshot('07-date-without-values-light.png');
            await e2eEnableDarkTheme(page);
            await expect(locator).toHaveScreenshot('07-date-without-values-dark.png');
        });
    });

    test.describe('E2eFilterBarSelectAllCounter', () => {
        const getComponent = (page: Page) => page.getByTestId('e2eFilterBarSelectAllCounter');

        /** Opens the pipe dropdown and returns the portaled overlay pane. `multiselect` at 1 is the pipe without the counter. */
        const openPipe = async (page: Page, type: 'multiselect' | 'tree', index: number = 0) => {
            await page.goto('/E2eFilterBarSelectAllCounter');

            const selector = type === 'tree' ? '.kbq-pipe__multi-tree-select' : '.kbq-pipe__multiselect';

            await getComponent(page).locator(selector).nth(index).locator('.kbq-select__trigger').click();

            const pane = page.locator('.cdk-overlay-pane');

            await pane.waitFor();

            return pane;
        };

        test('should show the counter with the number of selectable options', async ({ page }) => {
            const multiselect = await openPipe(page, 'multiselect');

            await expect(multiselect.locator('.kbq-pipe-select-all__counter')).toHaveText('8');

            const tree = await openPipe(page, 'tree');

            // Leaves only: the three group parents rendered above them are not counted.
            await expect(tree.locator('.kbq-pipe-select-all__counter')).toHaveText('10');
        });

        test('should recalculate the counter while searching', async ({ page }) => {
            const tree = await openPipe(page, 'tree');

            await tree.locator('input').fill('Admin');

            await expect(tree.locator('.kbq-pipe-select-all__counter')).toHaveText('3');

            const multiselect = await openPipe(page, 'multiselect');

            await multiselect.locator('input').fill('1');

            await expect(multiselect.locator('.kbq-pipe-select-all__counter')).toHaveText('1');
        });

        test('should keep a gap between the label and the counter', async ({ page }) => {
            const tree = await openPipe(page, 'tree');

            // The gap is a stylesheet margin: template whitespace between the label and the counter
            // is stripped by the compiler, so this pins the deterministic source of the spacing.
            await expect(tree.locator('.kbq-pipe-select-all__counter')).toHaveCSS('margin-inline-start', '4px');
        });

        test('should not render the counter when the option is off', async ({ page }) => {
            const multiselect = await openPipe(page, 'multiselect', 1);

            await expect(multiselect.locator('.kbq-pipe-select-all__counter')).toHaveCount(0);

            // The select-all row itself is still there: only the counter is gated by the option.
            // The e2e app runs in the Russian locale.
            await expect(multiselect.locator('kbq-option').first()).toContainText('Выбрать все');
        });

        test('panel', async ({ page }) => {
            await openPipe(page, 'tree');

            const pane = page.locator('.cdk-overlay-pane');

            await expect(pane).toHaveScreenshot('09-select-all-counter-light.png');
            await e2eEnableDarkTheme(page);
            await expect(pane).toHaveScreenshot('09-select-all-counter-dark.png');
        });
    });

    test.describe('E2eFilterBarDateWithHint', () => {
        const getComponent = (page: Page) => page.getByTestId('e2eFilterBarDateWithHint');

        test('states', async ({ page }) => {
            await page.goto('/E2eFilterBarDateWithHint');
            await getComponent(page).locator('.kbq-pipe__date button').first().focus();
            await page.keyboard.press('Enter');

            const panel = page.locator('.kbq-pipe-date__popover');

            await expect(panel.locator('input[formcontrolname="start"]')).toBeFocused();
            await expect(panel.locator('kbq-calendar').first()).toBeVisible();
            await expect(panel.locator('.kbq-date-period__hint')).toBeVisible();

            const locator = getComponent(page).getByTestId('e2eScreenshotTarget');

            await expect(locator).toHaveScreenshot('10-hint-light.png');
            await e2eEnableDarkTheme(page);
            await expect(locator).toHaveScreenshot('10-hint-dark.png');
        });
    });
});
