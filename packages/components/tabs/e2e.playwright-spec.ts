import { expect, Page, test } from '@playwright/test';
import { e2eEnableDarkTheme } from 'packages/e2e/utils';

/** Scrollport of every paginated tab header on the route — the thing that scrolls itself into position. */
const TAB_SCROLLPORT_SELECTOR = '.kbq-tab-header__scroll-container';

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

        test('states', async ({ page }) => {
            await page.goto('/E2eTabsStates');

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

            await expect(component).toHaveScreenshot('01-light.png');
            await e2eEnableDarkTheme(page);
            await expect(component).toHaveScreenshot('01-dark.png');
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
