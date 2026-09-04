import { Locator, Page } from '@playwright/test';

type FocusScrollWindow = Window & {
    __kbqOptionFocusOptions?: boolean[];
    __kbqOptionFocusPatched?: boolean;
};

/**
 * Records the `FocusOptions` every option-like element is focused with, so a spec can assert that a panel
 * never leans on the scroll `HTMLElement.focus()` performs implicitly.
 *
 * That implicit scroll is not portable: Blink runs it synchronously, while WebKit defers it to a later
 * rendering update, where it lands after — and undoes — whatever the reader scrolled in the meantime.
 * Components are expected to focus with `preventScroll: true` and reveal the element explicitly.
 *
 * Installed with `addInitScript` so the recording covers the focus calls a panel makes as it opens, not
 * just the ones a spec triggers afterwards. Call before `page.goto`, then read the flags back with
 * {@link e2eReadOptionFocusOptions}.
 */
export const e2eRecordOptionFocusOptions = async (page: Page): Promise<void> => {
    // Awaited rather than returned: `addInitScript` resolves to a Disposable — see `e2eDisableResizeObserver`.
    await page.addInitScript(() => {
        const target = window as FocusScrollWindow;

        target.__kbqOptionFocusOptions = [];

        // A page may be navigated more than once per spec; patch the prototype only once.
        if (target.__kbqOptionFocusPatched) return;

        target.__kbqOptionFocusPatched = true;

        const originalFocus = HTMLElement.prototype.focus;

        HTMLElement.prototype.focus = function (this: HTMLElement, options?: FocusOptions) {
            if (this.matches('.kbq-option, .kbq-tree-option, .kbq-dropdown-item')) {
                (window as FocusScrollWindow).__kbqOptionFocusOptions?.push(options?.preventScroll === true);
            }

            return originalFocus.call(this, options);
        };
    });
};

/** Reads back what {@link e2eRecordOptionFocusOptions} captured: one `preventScroll` flag per focus call. */
export const e2eReadOptionFocusOptions = (page: Page): Promise<boolean[]> =>
    page.evaluate(() => (window as FocusScrollWindow).__kbqOptionFocusOptions ?? []);

/** Waits two animation frames — long enough for a scroll a browser deferred past the current task to land. */
export const e2eSettleFrames = (page: Page): Promise<void> =>
    page.evaluate(
        () => new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve())))
    );

/** Reads a scrollport's current vertical offset. */
export const e2eScrollTopOf = (scrollport: Locator): Promise<number> =>
    scrollport.evaluate((element) => element.scrollTop);

/**
 * Waits until `scrollport`'s offset stops changing and returns it.
 *
 * A wheel gesture is applied over several frames, so reading the offset a fixed number of frames later
 * catches an intermediate value — the reason to wait for the value itself rather than for a frame count.
 */
export const e2eWaitForScrollEnd = (scrollport: Locator, from: number): Promise<number> =>
    scrollport.evaluate(
        (element, start) =>
            new Promise<number>((resolve) => {
                const stableFramesNeeded = 3;

                let previous = element.scrollTop;
                let stableFrames = 0;

                const check = () => {
                    // Waiting only for stability would resolve `start` unchanged when the gesture has not
                    // been applied yet — `mouse.wheel` does not wait for that — and report "never scrolled".
                    if (element.scrollTop !== start && element.scrollTop === previous) {
                        stableFrames++;
                    } else {
                        stableFrames = 0;
                        previous = element.scrollTop;
                    }

                    if (stableFrames >= stableFramesNeeded) {
                        resolve(previous);

                        return;
                    }

                    // No frame cap: Playwright's own test timeout reports a stuck scrollport with a far
                    // clearer message than a mid-flight offset that silently satisfies the assertion.
                    requestAnimationFrame(check);
                };

                requestAnimationFrame(check);
            }),
        from
    );

/** Whether `selector`'s match inside `scrollport` is fully within it. Null when nothing matches. */
export const e2eIsFullyInView = (scrollport: Locator, selector: string): Promise<boolean | null> =>
    scrollport.evaluate((element, itemSelector) => {
        const item = element.querySelector<HTMLElement>(itemSelector);

        if (!item) return null;

        const port = element.getBoundingClientRect();
        const box = item.getBoundingClientRect();

        // A one-pixel tolerance absorbs sub-pixel rounding at fractional zoom levels.
        return box.top >= port.top - 1 && box.bottom <= port.bottom + 1;
    }, selector);
