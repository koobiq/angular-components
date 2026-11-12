/**
 * Calculates the translation that points a pop-up arrow at a viewport point, clamped to the panel's arrow inset.
 *
 * @param placement - Resolved CSS placement of the panel.
 * @param panelRect - Panel rectangle in viewport coordinates.
 * @param point - Target point in viewport coordinates.
 * @param arrowCenterInset - Distance from a panel edge to the arrow center, in pixels.
 */
export const kbqGetPopUpArrowShift = (
    placement: string,
    panelRect: DOMRect,
    point: { x: number; y: number },
    arrowCenterInset: number
): { x: number; y: number } => {
    const horizontal =
        placement === 'top' ||
        placement === 'bottom' ||
        placement.startsWith('top-') ||
        placement.startsWith('bottom-');
    const vertical =
        placement === 'left' ||
        placement === 'right' ||
        placement.startsWith('left-') ||
        placement.startsWith('right-');

    if (!horizontal && !vertical) return { x: 0, y: 0 };

    const axis = horizontal ? 'x' : 'y';
    const panelStart = horizontal ? panelRect.left : panelRect.top;
    const panelEnd = horizontal ? panelRect.right : panelRect.bottom;
    const panelCenter = (panelStart + panelEnd) / 2;
    const alignedToStart = horizontal ? placement.endsWith('-left') : placement.endsWith('-top');
    const alignedToEnd = horizontal ? placement.endsWith('-right') : placement.endsWith('-bottom');
    const defaultCenter = alignedToStart
        ? panelStart + arrowCenterInset
        : alignedToEnd
          ? panelEnd - arrowCenterInset
          : panelCenter;
    const min = panelStart + arrowCenterInset;
    const max = panelEnd - arrowCenterInset;
    const pointCenter = min > max ? panelCenter : Math.min(Math.max(point[axis], min), max);
    const shift = pointCenter - defaultCenter;

    return { x: horizontal ? shift : 0, y: vertical ? shift : 0 };
};
