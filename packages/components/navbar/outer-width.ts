/**
 * Outer width of an element: its border box plus horizontal margins.
 *
 * Measured with `getBoundingClientRect()` rather than `getComputedStyle().width`, which resolves to the used
 * content-box width whatever `box-sizing` says: `.kbq-navbar-item` is `border-box` with horizontal padding, and
 * the navbar compares these sums against its own border box.
 */
export const getOuterWidth = (element: Element, window: Window): number => {
    const { marginLeft, marginRight } = window.getComputedStyle(element);

    return [marginLeft, marginRight].reduce(
        (acc, item) => acc + (parseFloat(item) || 0),
        element.getBoundingClientRect().width
    );
};
