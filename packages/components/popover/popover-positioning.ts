// Matches popover.scss: the 24px arrow inset plus half of its 12px layout size.
const ARROW_CENTER_INSET = 30;

export const getPopoverArrowShift = (
    placement: string,
    panelRect: DOMRect,
    point: { x: number; y: number }
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
        ? panelStart + ARROW_CENTER_INSET
        : alignedToEnd
          ? panelEnd - ARROW_CENTER_INSET
          : panelCenter;
    const min = panelStart + ARROW_CENTER_INSET;
    const max = panelEnd - ARROW_CENTER_INSET;
    const pointCenter = min > max ? panelCenter : Math.min(Math.max(point[axis], min), max);
    const shift = pointCenter - defaultCenter;

    return { x: horizontal ? shift : 0, y: vertical ? shift : 0 };
};
