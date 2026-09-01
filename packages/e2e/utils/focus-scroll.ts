import { Page } from '@playwright/test';

/**
 * Records the `FocusOptions` every option-like element is focused with, so a spec can assert that a panel
 * never leans on the scroll `HTMLElement.focus()` performs implicitly.
 *
 * That implicit scroll is not portable: Blink runs it synchronously, while WebKit defers it to a later
 * rendering update, where it lands after — and undoes — whatever the reader scrolled in the meantime.
 * Panels are expected to focus with `preventScroll: true` and scroll explicitly instead.
 *
 * Call before the interaction, then read the flags back with {@link e2eReadOptionFocusOptions}.
 */
export const e2eRecordOptionFocusOptions = (page: Page): Promise<void> =>
    page.evaluate(() => {
        const recorded: boolean[] = [];

        (window as unknown as { __kbqOptionFocusOptions: boolean[] }).__kbqOptionFocusOptions = recorded;

        const originalFocus = HTMLElement.prototype.focus;

        HTMLElement.prototype.focus = function (this: HTMLElement, options?: FocusOptions) {
            if (this.matches('.kbq-option, .kbq-tree-option, .kbq-dropdown-item')) {
                recorded.push(options?.preventScroll === true);
            }

            return originalFocus.call(this, options);
        };
    });

/** Reads back what {@link e2eRecordOptionFocusOptions} captured: one `preventScroll` flag per focus call. */
export const e2eReadOptionFocusOptions = (page: Page): Promise<boolean[]> =>
    page.evaluate(() => (window as unknown as { __kbqOptionFocusOptions?: boolean[] }).__kbqOptionFocusOptions ?? []);
