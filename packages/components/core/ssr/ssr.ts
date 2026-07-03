/**
 * SSR-safe wrapper for `Element.getClientRects()`.
 * Returns an empty array in SSR environments where the DOM method is unavailable.
 * @docs-private
 */
export function kbqGetClientRects(element: Element): DOMRectList | readonly DOMRect[] {
    if (typeof element.getClientRects !== 'function') return [];

    return element.getClientRects();
}

/**
 * SSR-safe wrapper for `Element.getBoundingClientRect()`.
 * Returns a zero-rect in SSR environments where the DOM method is unavailable.
 * @docs-private
 */
export function kbqGetBoundingClientRect(element: Element): DOMRect {
    if (typeof element.getBoundingClientRect !== 'function') {
        // Cast is intentional: callers type-check against DOMRect, but the object is a plain
        // zero-rect. It will fail `instanceof DOMRect` — do not use it for instanceof checks.
        return { width: 0, height: 0, top: 0, right: 0, bottom: 0, left: 0, x: 0, y: 0, toJSON: () => ({}) } as DOMRect;
    }

    return element.getBoundingClientRect();
}
