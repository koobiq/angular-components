import { expect, type Page, test } from '@playwright/test';
import { e2eEnableDarkTheme, e2eWaitForSettledScrollbars } from '../../e2e/utils';

test.describe('KbqTopBarModule', () => {
    test.describe('E2eTopBarStates', () => {
        const getComponent = (page: Page) => page.getByTestId('e2eTopBarStates');

        test('states', async ({ page }) => {
            await page.goto('/E2eTopBarStates');

            await expect(getComponent(page)).toHaveScreenshot('01-light.png');
            await e2eEnableDarkTheme(page);
            await expect(getComponent(page)).toHaveScreenshot('01-dark.png');
        });
    });

    test.describe('E2eTopBarSticky', () => {
        const getComponent = (page: Page) => page.getByTestId('e2eTopBarSticky');
        const getScroller = (page: Page) => page.getByTestId('e2eTopBarStickyScroller');
        const getDropdownTrigger = (page: Page) => page.getByTestId('e2eTopBarStickyDropdownTrigger');

        // One shot carries both halves of the layer work: the rows pass under the bar because
        // `--kbq-top-bar-inset-block-start` is what makes the default `position: sticky` take effect, and
        // the dropdown paints over the bar because the bar sits at 990 instead of on the overlay layer.
        test('should hold the bar over the scrolled rows and under the dropdown it opens', async ({ page }) => {
            await page.goto('/E2eTopBarSticky');

            await getScroller(page).evaluate((element) => element.scrollTo({ top: 200 }));
            // The scroll offset is part of the state being captured, not a step on the way to it.
            await expect(getScroller(page)).toHaveJSProperty('scrollTop', 200);

            await getDropdownTrigger(page).click();
            await expect(page.locator('.cdk-overlay-pane')).toHaveCount(1);

            // The dropdown flashes its track on open and this shot lands inside that window. Measured on
            // this route the track is revealed with no bar and no thumb — three items do not overflow the
            // panel — so crossing the window is pixel-identical today. The wait is what keeps that true: a
            // fourth item would give the revealed track a thumb to paint, and the shot would start landing
            // on whichever side of `hideDelay` the machine was on. Page-scoped, since the panel is in an
            // overlay at body level rather than under the screenshot target.
            await e2eWaitForSettledScrollbars(page, 1);

            await expect(getComponent(page)).toHaveScreenshot('02-light.png');
            await e2eEnableDarkTheme(page);
            await expect(getComponent(page)).toHaveScreenshot('02-dark.png');
        });
    });

    test.describe('E2eTopBarTitleBreadcrumbs', () => {
        // One read of every box the test compares, after the bars are on screen: nothing is polled for a value that
        // never changes, and the assertions below see a single consistent layout.
        const measure = (page: Page) =>
            page.evaluate(() => {
                const relative = (bar: Element | null, text: Element | null) => {
                    if (!bar || !text) return null;
                    const barBox = bar.getBoundingClientRect();
                    const textBox = text.getBoundingClientRect();

                    return {
                        barHeight: barBox.height,
                        left: textBox.x - barBox.x,
                        centre: textBox.y + textBox.height / 2 - barBox.y
                    };
                };
                const title = relative(
                    document.querySelector('[data-testid=e2eTopBarTitleBar]'),
                    document.querySelector('[data-testid=e2eTopBarTitleText]')
                );
                const crumbsBar = document.querySelector('[data-testid=e2eTopBarBreadcrumbsBar]');
                const crumbs = relative(
                    crumbsBar,
                    crumbsBar?.querySelector('.kbq-breadcrumb-item .kbq-button-text') ?? null
                );

                return title && crumbs ? { title, crumbs } : null;
            });

        // A screenshot shows that the text moved, but not why; the two variants of the bar have to agree on the number.
        test('should place the page title where size="big" breadcrumbs sit', async ({ page }) => {
            await page.goto('/E2eTopBarTitleBreadcrumbs');

            const titleText = page.getByTestId('e2eTopBarTitleText');
            const firstCrumbText = page
                .getByTestId('e2eTopBarBreadcrumbsBar')
                .locator('.kbq-breadcrumb-item .kbq-button-text')
                .first();

            await expect(titleText).toBeVisible();
            await expect(firstCrumbText).toBeVisible();

            const layout = await measure(page);

            expect(layout).not.toBeNull();
            expect(layout!.title.barHeight).toBe(layout!.crumbs.barHeight);
            // The same left edge, and the same vertical centre inside the bar.
            expect(layout!.title.left).toBeCloseTo(layout!.crumbs.left, 0);
            expect(layout!.title.centre).toBeCloseTo(layout!.crumbs.centre, 0);

            // "One size" is the point of the change, and the boxes above cannot see a typography regression: a title
            // that fell back to 20/700 would keep the same 32 px line box.
            await expect(titleText).toHaveCSS('font-size', '18px');
            await expect(titleText).toHaveCSS('font-weight', '600');
            await expect(firstCrumbText).toHaveCSS('font-size', '18px');
            await expect(firstCrumbText).toHaveCSS('font-weight', '600');
        });

        test('should grow the bar instead of painting over it when the title wraps', async ({ page }) => {
            await page.goto('/E2eTopBarTitleBreadcrumbs');

            const title = page.getByTestId('e2eTopBarWrappingTitleText');

            await expect(title).toBeVisible();
            // The title overflows its own line box when the bar is a fixed height; the minimum height lets it grow.
            await expect
                .poll(() => title.evaluate((element) => element.scrollHeight <= element.clientHeight))
                .toBe(true);

            const heights = await page.evaluate(() => {
                const bar = document.querySelector('[data-testid=e2eTopBarWrappingTitleBar]')!;
                const title = document.querySelector('[data-testid=e2eTopBarWrappingTitleText]')!;
                const barBox = bar.getBoundingClientRect();
                const range = document.createRange();

                range.selectNodeContents(title);

                return {
                    bar: barBox.height,
                    barBottom: barBox.bottom,
                    inkBottom: range.getBoundingClientRect().bottom
                };
            });

            expect(heights.bar).toBeGreaterThan(56);
            expect(heights.inkBottom).toBeLessThanOrEqual(heights.barBottom);
        });
    });
});
