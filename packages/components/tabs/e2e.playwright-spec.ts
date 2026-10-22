import { expect, Page, test } from '@playwright/test';
import {
    e2eEnableDarkTheme,
    e2eExpectNoScrollbarAfterFlash,
    e2eWaitForFonts,
    e2eWaitForSettledScrollbars
} from 'packages/e2e/utils';

/** Scrollport of every paginated tab header on the route — the thing that scrolls itself into position. */
const TAB_SCROLLPORT_SELECTOR = '.kbq-tab-header__scroll-container';

/** A strip that has not scrolled. */
const STRIP_AT_START = 'at the start';

/** Where the header's scroll correction leaves a strip that revealed its selected tab towards the end. */
const STRIP_SELECTED_AGAINST_NEXT_ARROW = 'selected tab against the next arrow';

/**
 * Where each paginated strip on the route rests, by the test id of its group.
 *
 * Read from the same metrics the scroll correction uses, so a strip that was measured in a fallback face and
 * then repainted in the webfont reads as how far the selected tab overshoots the arrow, not as a pixel count.
 */
const getStripPositions = (page: Page): Promise<Record<string, string>> =>
    page.evaluate(
        ({ atStart, againstNextArrow }) =>
            Object.fromEntries(
                Array.from(document.querySelectorAll('.kbq-tab-header__pagination-controls_enabled')).map((header) => {
                    const group = header.closest('kbq-tab-group')?.getAttribute('data-testid');
                    const strip = header.querySelector<HTMLElement>('.kbq-tab-header__scroll-container')!;
                    const nextArrow = header.querySelector<HTMLElement>('.kbq-tab-header__pagination_after')!;
                    const selected = header.querySelector<HTMLElement>('.kbq-tab-label.kbq-selected')!;

                    if (strip.scrollLeft === 0) return [group, atStart];

                    const overshoot =
                        selected.offsetLeft +
                        selected.offsetWidth -
                        strip.scrollLeft -
                        (strip.clientWidth - nextArrow.clientWidth);

                    return [
                        group,
                        overshoot === 0 ? againstNextArrow : `selected tab ${overshoot}px past the next arrow`
                    ];
                })
            ),
        { atStart: STRIP_AT_START, againstNextArrow: STRIP_SELECTED_AGAINST_NEXT_ARROW }
    );

/**
 * Waits until no tab header has fired a `scroll` event for `quietMs`.
 *
 * `KbqTabHeader` reveals the selected tab with `scrollTo({ behavior: 'smooth' })` — queued behind a
 * 100ms debounce and then easing for roughly another 400ms — so a shot taken without this lands on
 * an arbitrary frame of that animation. `animations: 'disabled'` does not reach it: it fast-forwards
 * CSS animations and transitions, and a programmatic smooth scroll is neither.
 *
 * `toHaveScreenshot`'s own re-shoot loop does not rescue it either. That stops as soon as two
 * consecutive frames match, which both the easing tail and the debounce window before the scroll has
 * even started satisfy while the header is still on its way to the settled position.
 *
 * Quiet time rather than a stable-value poll, because those two windows are exactly the ones in
 * which nothing scrolls yet nothing has settled. `quietMs` has to outlast the longer of them, plus
 * the change-detection throttle that repaints the pagination arrows and the edge masks after the
 * last scroll event.
 */
const waitForSettledTabScroll = (page: Page, quietMs = 250): Promise<void> =>
    page.evaluate(
        ({ scrollportSelector, quietTime }) =>
            new Promise<void>((resolve) => {
                const scrollports = Array.from(document.querySelectorAll(scrollportSelector));

                let timer = 0;

                const settle = () => {
                    scrollports.forEach((scrollport) => scrollport.removeEventListener('scroll', restart));
                    resolve();
                };

                const restart = () => {
                    window.clearTimeout(timer);
                    timer = window.setTimeout(settle, quietTime);
                };

                scrollports.forEach((scrollport) => scrollport.addEventListener('scroll', restart, { passive: true }));

                // Armed up front, so a route where nothing ever scrolls resolves after one quiet
                // window instead of waiting out the test timeout.
                restart();
            }),
        { scrollportSelector: TAB_SCROLLPORT_SELECTOR, quietTime: quietMs }
    );

test.describe('KbqTabsModule', () => {
    test.describe('E2eTabsStates', () => {
        const getComponent = (page: Page) => page.getByTestId('e2eTabsStates');
        const getTabsUnderlined = (page: Page) => page.getByTestId('e2eTabsUnderlined');

        /**
         * The strips scroll their selected tab into view from a measurement of the labels, so the faces go into
         * the page first and only then are the groups asked for: measured in a fallback face, a strip rests
         * wherever that face put it (`docs/e2e-flakiness.md`).
         */
        const showTabs = async (page: Page) => {
            await page.goto('/E2eTabsStates');
            await e2eWaitForFonts(page);
            // Dispatched rather than clicked: the pointer would otherwise rest on the first group as it renders.
            await page.getByTestId('e2eTabsStatesTrigger').dispatchEvent('click');
        };

        test('states', async ({ page }) => {
            await showTabs(page);

            const component = getComponent(page);

            // Flaky test workaround: click to underlined tab to ensure proper bottom outline rendering
            await getTabsUnderlined(page).locator('.kbq-tab-label_underlined').nth(0).click();

            // An empty match is indistinguishable from "everything already settled" inside the helper,
            // so the scrollports are pinned here: a renamed class fails loudly instead of degrading
            // the wait below into a bare sleep and letting the flake back in looking fixed.
            await expect(page.locator(TAB_SCROLLPORT_SELECTOR)).not.toHaveCount(0);

            // The groups whose selected tab starts off-screen scroll it into view on their own, and
            // the click above queues another correction. Only the light shot needs the wait — the
            // theme swap that follows repaints without touching any scroll position.
            await waitForSettledTabScroll(page);

            await expect
                .poll(() => getStripPositions(page))
                .toEqual({
                    e2eTabsWithIcons: STRIP_SELECTED_AGAINST_NEXT_ARROW,
                    e2eTabsUnderlined: STRIP_AT_START,
                    e2eTabsWithIconsOnSurface: STRIP_SELECTED_AGAINST_NEXT_ARROW,
                    e2eTabsUnderlinedOnSurface: STRIP_AT_START
                });

            // A track in each of the 106 tab bodies and in the 4 vertical headers; the horizontal headers run
            // in `hidden` mode. Waited last, because every scroll correction above reveals the track again.
            await e2eWaitForSettledScrollbars(component, 110);

            await expect(component).toHaveScreenshot('01-light.png');
            await e2eEnableDarkTheme(page);
            await expect(component).toHaveScreenshot('01-dark.png');
        });

        test('should follow the vertical binding rather than the attribute', async ({ page }) => {
            await showTabs(page);

            await expect(page.getByTestId('e2eTabsVerticalBoundFalse')).not.toHaveClass(/kbq-tab-group_vertical/);
        });
    });

    test.describe('E2eTabsScrollbarFlash', () => {
        const getTrack = (page: Page, testId: string) =>
            page.getByTestId(testId).locator('.kbq-tab-header__scroll-container > kbq-scrollbar-track');

        test.beforeEach(async ({ page }) => {
            await page.goto('/E2eTabsScrollbarFlash');
        });

        test('reveals the scrollbar once the strip is rendered, without the pointer going near it', async ({
            page
        }) => {
            const track = getTrack(page, 'e2eTabsFlashOverflowing');

            await expect(track).toHaveClass(/kbq-scrollbar-track_revealed/);
            await expect(track.locator('.kbq-scrollbar-track__bar')).not.toHaveCount(0);
        });

        test('reveals nothing for a strip whose tabs fit', async ({ page }) => {
            await e2eExpectNoScrollbarAfterFlash(
                page.getByTestId('e2eTabsFlashFitting').locator('.kbq-tab-header__scroll-container'),
                page.getByTestId('e2eTabsFlashOverflowing')
            );
        });
    });

    test.describe('E2eTabNavBar', () => {
        test('should make disabled links unclickable', async ({ page }) => {
            await page.goto('/E2eTabNavBar');

            const enabledLink = page.getByTestId('tabNavBar_default').locator('a');
            const disabledLink = page.getByTestId('tabNavBar_disabled').locator('a');

            await expect(enabledLink).not.toHaveCSS('pointer-events', 'none');
            await expect(disabledLink).toHaveCSS('pointer-events', 'none');
        });
    });
});
