import { Page } from '@playwright/test';

/**
 * Waits until no element matching `selector` has fired a `scroll` event for `quietMs`.
 *
 * Call this before screenshotting a component that scrolls itself into position. `KbqTabHeader`
 * reveals the selected tab with `scrollTo({ behavior: 'smooth' })` — queued behind a 100ms debounce
 * and then easing for roughly another 400ms — so a shot taken without this lands on an arbitrary
 * frame of that animation. `animations: 'disabled'` does not reach it: it fast-forwards CSS
 * animations and transitions, and a programmatic smooth scroll is neither.
 *
 * `toHaveScreenshot`'s own re-shoot loop does not rescue it either. That stops as soon as two
 * consecutive frames match, which both the easing tail and the debounce window before the scroll
 * has even started satisfy while the component is still on its way to the settled position.
 *
 * Quiet time rather than a stable-value poll, because those two windows are exactly the ones in
 * which nothing scrolls yet nothing has settled. `quietMs` has to outlast the longer of them, plus
 * the change-detection throttle that repaints the pagination arrows and the edge masks after the
 * last scroll event.
 */
export const e2eWaitForSettledScrollPositions = (page: Page, selector: string, quietMs = 250): Promise<void> =>
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
        { scrollportSelector: selector, quietTime: quietMs }
    );
