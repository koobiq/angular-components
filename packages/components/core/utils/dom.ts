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

/**
 * Rendered height of an element, or `0` when it has no box.
 *
 * `getClientRects()` returns an empty list on the server and for elements that are not laid out, so
 * the first rect is read defensively rather than through `getBoundingClientRect()`, whose zeroes are
 * indistinguishable from a genuinely collapsed element.
 */
export const kbqGetElementHeight = (element: Element): number => {
    return element.getClientRects()[0]?.height ?? 0;
};
