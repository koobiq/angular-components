import { _getFocusedElementPierceShadowDom } from '@angular/cdk/platform';
import { ElementRef, inject } from '@angular/core';

/**
 * Injects the native element for the current component.
 */
export const kbqInjectNativeElement = <T extends Element = HTMLElement>(): T => {
    return inject<ElementRef<T>>(ElementRef<T>).nativeElement;
};

/**
 * Focuses `element` and scrolls it into view by the shortest distance, leaving a visible one alone.
 *
 * The reveal is explicit because the one `focus()` performs implicitly is not portable: WebKit defers it
 * to a later rendering update, where it lands after — and undoes — any scrolling the reader did in the
 * meantime. Letting the element reveal itself keeps every consumer working, whatever it uses as a scroll
 * container, and the browser resolves that container rather than the caller guessing at it.
 *
 * Pass `skipReveal` when the pointer caused the focus: the element is already under the cursor, so
 * revealing it would shift the list out from under it.
 */
export const kbqFocusAndReveal = (element: HTMLElement, skipReveal = false): void => {
    if (typeof element.focus !== 'function') return;

    // A focus listener calling back into `focus` must not scroll a second time. Read through shadow
    // roots, where `document.activeElement` reports the host instead of the element that holds focus.
    const wasFocused = _getFocusedElementPierceShadowDom() === element;

    element.focus({ preventScroll: true });

    if (skipReveal || wasFocused) return;

    element.scrollIntoView?.({ block: 'nearest', inline: 'nearest' });
};

/** Axis a scroll-overflow check applies to. */
export type KbqScrollAxis = 'horizontal' | 'vertical';

/**
 * Largest disagreement (px) between an element's box metrics and the scroll offset the browser actually
 * hands out.
 *
 * `scrollWidth`/`clientWidth` are rounded to whole CSS pixels (up to 1px of error) while the scroll offset
 * snaps to the device-pixel grid, whose step is `1 / devicePixelRatio` CSS px — so the bound is
 * `1 + 1 / devicePixelRatio` and widens as the page is zoomed out, rather than being a constant. At 50% zoom
 * on a 1× display it is already 3px, which is why a fixed tolerance leaks the bug back in at low zoom.
 *
 * The view is resolved from the element rather than a global, so the helper stays usable on the server.
 */
export const kbqGetScrollOverflowTolerance = (element: Element): number => {
    return 1 + 1 / (element.ownerDocument.defaultView?.devicePixelRatio || 1);
};

/**
 * Whether `element` has scroll overflow along `axis` larger than the measurement error of the metrics it is
 * derived from — i.e. whether there is a scroll range the user can actually reach.
 */
export const kbqHasScrollOverflow = (element: Element, axis: KbqScrollAxis = 'horizontal'): boolean => {
    const overflow =
        axis === 'horizontal' ? element.scrollWidth - element.clientWidth : element.scrollHeight - element.clientHeight;

    return overflow > kbqGetScrollOverflowTolerance(element);
};

/**
 * Rendered height of an element, or `0` when it has no box.
 *
 * `getClientRects()` returns an empty list for elements that are not laid out and is missing entirely
 * from the server DOM, so both the method and the first rect are read defensively rather than going
 * through `getBoundingClientRect()`, whose zeroes are indistinguishable from a genuinely collapsed
 * element.
 */
export const kbqGetElementHeight = (element: Element): number => {
    return element.getClientRects?.()?.[0]?.height ?? 0;
};
