import { coerceCssPixelValue } from '@angular/cdk/coercion';

/**
 * Maximum height of an overlay panel's scrollable content, in pixels. `null` falls back to the
 * `--kbq-select-panel-size-max-height` design token.
 *
 * The cap covers the scrollable list only — a search field or a footer rendered beside it adds to the
 * panel's total height. With a `cdk-virtual-scroll-viewport` the value is an exact height rather than a
 * cap, because the viewport pins both its `min-height` and its `max-height` to the token.
 */
export type KbqPanelMaxHeight = number | null;

/**
 * Renders `panelMaxHeight` as a CSS length for the `--kbq-select-panel-size-max-height` token.
 *
 * A non-finite value yields `null` so that Angular removes the inline custom property and the stylesheet
 * default applies again. A negative value is clamped to `0` because `max-height` rejects negative lengths
 * at computed-value time, which would drop the declaration and leave the list unbounded rather than at
 * its default height.
 * @docs-private
 */
export function kbqResolvePanelMaxHeightToken(panelMaxHeight: KbqPanelMaxHeight | undefined): string | null {
    // `numberAttribute` coerces `null` and other invalid bindings to `NaN`, so guard on finiteness
    // rather than on `null`, which never reaches us from a template binding.
    return Number.isFinite(panelMaxHeight) ? coerceCssPixelValue(Math.max(panelMaxHeight as number, 0)) : null;
}

/**
 * Default cap of an overlay panel's scrollable content, in pixels. Mirrors the stylesheet default of
 * `--kbq-select-panel-size-max-height` so that the two cannot drift apart.
 * @docs-private
 */
export const KBQ_PANEL_DEFAULT_MAX_HEIGHT = 256;

/**
 * Geometry needed to work out how tall an anchored panel's scrollable list may be.
 * @docs-private
 */
export interface KbqPanelSpaceContext {
    /** Viewport-relative top of the element the panel is anchored to. */
    triggerTop: number;
    /** Viewport-relative bottom of the element the panel is anchored to. */
    triggerBottom: number;
    /** Height of the viewport the panel has to fit into. */
    viewportHeight: number;
    /** Margin the overlay keeps from the viewport edge, i.e. `cdkConnectedOverlayViewportMargin`. */
    viewportMargin: number;
    /**
     * Everything in the panel that is not the scrollable list and therefore adds to its total height: the
     * trigger gap, the list padding, a search field and a footer.
     */
    chromeHeight: number;
}

/**
 * How much room the panel's scrollable list has on each side of the trigger. Negative means it does not fit.
 * @docs-private
 */
export interface KbqPanelSideSpace {
    above: number;
    below: number;
}

/**
 * Measures how much room the panel's scrollable list has on either side of the trigger.
 *
 * Returns `null` for geometry that cannot be trusted — a collapsed trigger rect or a zero-height viewport, which
 * is what a DOM without layout reports, on the server and under jsdom.
 * @docs-private
 */
export function kbqResolvePanelSideSpace(context: KbqPanelSpaceContext): KbqPanelSideSpace | null {
    const { triggerTop, triggerBottom, viewportHeight, viewportMargin, chromeHeight } = context;

    if (![triggerTop, triggerBottom, viewportHeight, viewportMargin, chromeHeight].every(Number.isFinite)) {
        return null;
    }

    if (viewportHeight <= 0 || triggerBottom <= triggerTop) return null;

    return {
        above: triggerTop - viewportMargin - chromeHeight,
        below: viewportHeight - triggerBottom - viewportMargin - chromeHeight
    };
}

/**
 * Where a connected panel sits relative to the trigger it is anchored to.
 * @docs-private
 */
export type KbqPanelAnchor = 'above' | 'below' | 'overlap';

/**
 * What the DOM reports about the first row of a trigger that lays its content out in rows.
 * @docs-private
 */
export interface KbqTriggerFirstRowMeasurements {
    /** Viewport-relative top of the element the overlay is anchored to. */
    originTop: number;
    /** Viewport-relative bottom of the element the overlay is anchored to. */
    originBottom: number;
    /** Border-box top of the row container. */
    listTop: number;
    /** Border-box bottom of the row container. */
    listBottom: number;
    /** Viewport-relative bottom of the lowest element sitting on the first laid-out row. */
    firstRowBottom: number;
    /** Scroll offset of the row container, so that a scrolled container still reports its own first row. */
    listScrollTop: number;
}

/**
 * Distance from the trigger's top edge down to where a panel would start if the trigger had a single row —
 * equivalently, the trigger's height with rows 2..N removed.
 *
 * Returns `null` for geometry that cannot be trusted: a collapsed rect (the server, a DOM without layout), or
 * a row container that is not what drives the trigger's height, which a result reaching past the trigger's own
 * bottom edge gives away.
 * @docs-private
 */
export function kbqResolveTriggerFirstRowOffset(measurements: KbqTriggerFirstRowMeasurements): number | null {
    const { originTop, originBottom, listTop, listBottom, firstRowBottom, listScrollTop } = measurements;

    if (![originTop, originBottom, listTop, listBottom, firstRowBottom, listScrollTop].every(Number.isFinite)) {
        return null;
    }

    const originHeight = originBottom - originTop;

    if (originHeight <= 0) return null;

    // The first row measured in the container's own, unscrolled coordinates, plus the chrome the trigger keeps
    // above and below its rows — the matcher's padding and the field's border.
    const firstRowHeight = firstRowBottom + listScrollTop - listTop;
    const offset = listTop - originTop + firstRowHeight + (originBottom - listBottom);

    return offset > 0 && offset <= originHeight ? offset : null;
}

/**
 * Room the panel's scrollable list has when it is anchored to the trigger's first row instead of to the
 * trigger's bottom edge. The same arithmetic as {@link kbqResolvePanelSideSpace}, on a trigger cut to one row.
 * @docs-private
 */
export function kbqResolveOverlapPanelSpace(context: KbqPanelSpaceContext, firstRowOffset: number): number | null {
    const space = kbqResolvePanelSideSpace({ ...context, triggerBottom: context.triggerTop + firstRowOffset });

    return space && space.below;
}

/**
 * Everything the first-row anchor decision needs beyond {@link KbqPanelSpaceContext}.
 * @docs-private
 */
export interface KbqPanelAnchorOptions {
    /** Result of {@link kbqResolveTriggerFirstRowOffset}; `null` when there is no row to anchor to. */
    firstRowOffset: number | null;
    /** Height the scrollable list takes with no viewport clamp in force. */
    naturalListHeight: number;
    /** Whether the panel is already anchored to the first row, which widens the band it stays in. */
    anchored?: boolean;
}

/**
 * Whether the panel should be anchored below the trigger's first row and rendered over the rest of it.
 *
 * Three things have to hold. The trigger must have more than one row, or there is nothing to overlap. It must
 * be taller than the panel, or the room beside it is the better trade and the panel belongs on a side. And
 * the panel must fit there at its full height — the caller adds this as a THIRD `ConnectedPosition`,
 * and when no position fits the overlay falls back to whichever goes off-screen the least, so an anchor that
 * does not fit would outrank `above`/`below` on that fallback and move panels that have no business moving.
 * Gating on the fit keeps the fallback ranking exactly as it is without this anchor.
 *
 * `anchored` widens the height test by one row, so that deselecting a single option cannot bounce a panel
 * sitting right on the boundary across several hundred pixels.
 * @docs-private
 */
export function kbqShouldAnchorPanelToFirstRow(
    context: KbqPanelSpaceContext,
    { firstRowOffset, naturalListHeight, anchored = false }: KbqPanelAnchorOptions
): boolean {
    if (firstRowOffset === null) return false;

    if (!Number.isFinite(naturalListHeight)) return false;

    // Read off the same rect the space calculation uses, so the two can never disagree.
    const triggerHeight = context.triggerBottom - context.triggerTop;

    // A single-row trigger has nothing to overlap.
    if (triggerHeight - firstRowOffset <= 1) return false;

    const hysteresis = anchored ? firstRowOffset : 0;

    if (triggerHeight + hysteresis <= context.chromeHeight + naturalListHeight) return false;

    // The overlay rejects a position whose top edge is off the top of the viewport, which a trigger scrolled
    // past the fold produces.
    if (context.triggerTop + firstRowOffset < 0) return false;

    const space = kbqResolveOverlapPanelSpace(context, firstRowOffset);

    return space !== null && space >= naturalListHeight;
}
