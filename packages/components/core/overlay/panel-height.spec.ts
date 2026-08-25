import {
    KBQ_PANEL_MIN_MAX_HEIGHT,
    KbqPanelAnchorOptions,
    KbqPanelSpaceContext,
    KbqTriggerFirstRowMeasurements,
    kbqResolveAvailablePanelMaxHeight,
    kbqResolveOverlapPanelSpace,
    kbqResolvePanelMaxHeightToken,
    kbqResolvePanelSideSpace,
    kbqResolveTriggerFirstRowOffset,
    kbqShouldAnchorPanelToFirstRow
} from './panel-height';

describe('kbqResolvePanelMaxHeightToken', () => {
    it('should render a height as a CSS length', () => {
        expect(kbqResolvePanelMaxHeightToken(300)).toBe('300px');
    });

    it('should treat zero as an explicit height rather than as unset', () => {
        expect(kbqResolvePanelMaxHeightToken(0)).toBe('0px');
    });

    it('should clamp a negative height to zero', () => {
        // A negative `max-height` is invalid at computed-value time, so the declaration would be dropped
        // and the list would end up unbounded instead of falling back to the token default.
        expect(kbqResolvePanelMaxHeightToken(-10)).toBe('0px');
    });

    it.each([
        ['null', null],
        ['undefined', undefined],
        // `numberAttribute` yields NaN — not null — for an invalid binding such as [panelMaxHeight]="null".
        ['NaN', NaN]
    ])('should leave the token unset when the height is %s', (_, panelMaxHeight) => {
        expect(kbqResolvePanelMaxHeightToken(panelMaxHeight)).toBeNull();
    });
});

describe('kbqResolvePanelSideSpace', () => {
    const context = (overrides: Partial<KbqPanelSpaceContext> = {}): KbqPanelSpaceContext => ({
        triggerTop: 100,
        triggerBottom: 130,
        viewportHeight: 800,
        viewportMargin: 4,
        chromeHeight: 12,
        ...overrides
    });

    it('should subtract the margin and the panel chrome from both sides', () => {
        expect(kbqResolvePanelSideSpace(context())).toEqual({ above: 84, below: 654 });
    });

    it('should report a side that does not fit as negative', () => {
        expect(kbqResolvePanelSideSpace(context({ triggerTop: 8 }))?.above).toBe(-8);
    });

    it('should shrink both sides as the trigger grows', () => {
        // A multiline trigger grows downward, so it eats into the space below without freeing any above.
        const grown = kbqResolvePanelSideSpace(context({ triggerBottom: 400 }));

        expect(grown).toEqual({ above: 84, below: 384 });
    });

    it('should reject a collapsed trigger rect', () => {
        // What `getBoundingClientRect()` reports before layout has run, on the server and under jsdom.
        expect(kbqResolvePanelSideSpace(context({ triggerTop: 0, triggerBottom: 0 }))).toBeNull();
    });

    it('should reject a viewport with no height', () => {
        expect(kbqResolvePanelSideSpace(context({ viewportHeight: 0 }))).toBeNull();
    });

    it('should reject geometry that is not finite', () => {
        expect(kbqResolvePanelSideSpace(context({ viewportHeight: NaN }))).toBeNull();
    });
});

describe('kbqResolveAvailablePanelMaxHeight', () => {
    const context = (overrides: Partial<KbqPanelSpaceContext> = {}): KbqPanelSpaceContext => ({
        triggerTop: 100,
        triggerBottom: 130,
        viewportHeight: 800,
        viewportMargin: 4,
        chromeHeight: 12,
        ...overrides
    });

    it('should leave the default cap in force when there is ample room', () => {
        expect(kbqResolveAvailablePanelMaxHeight(context())).toBeNull();
    });

    /** A 180px trigger in a 600px viewport: 204px left above it, 184px below — neither fits the default cap. */
    const crampedBothSides = context({ triggerTop: 220, triggerBottom: 400, viewportHeight: 600 });

    it('should measure the roomier side when no side is given', () => {
        expect(kbqResolveAvailablePanelMaxHeight(crampedBothSides)).toBe(204);
    });

    it('should measure the side it is given even when the other one has more room', () => {
        expect(kbqResolveAvailablePanelMaxHeight(crampedBothSides, 'below')).toBe(184);
    });

    it('should leave the default cap in force when the requested side is ample, whatever the other side has', () => {
        // Above leaves 284 and below only 54, but the panel is on the side that fits — nothing to clamp.
        const available = kbqResolveAvailablePanelMaxHeight(
            context({ triggerTop: 300, triggerBottom: 330, viewportHeight: 400 }),
            'above'
        );

        expect(available).toBeNull();
    });

    it('should never resolve below the minimum usable height', () => {
        // A panel starved past this point needs the other side, not an even shorter list.
        const available = kbqResolveAvailablePanelMaxHeight(context({ triggerTop: 700, triggerBottom: 780 }), 'below');

        expect(available).toBe(KBQ_PANEL_MIN_MAX_HEIGHT);
    });

    it('should honour a custom minimum', () => {
        expect(kbqResolveAvailablePanelMaxHeight(context({ triggerBottom: 790 }), 'below', 32)).toBe(32);
    });

    it('should honour a custom default cap', () => {
        // 200px above: short of the 256px default, so it clamps, but ample for a 128px cap.
        const cramped = context({ triggerTop: 216, triggerBottom: 246 });

        expect(kbqResolveAvailablePanelMaxHeight(cramped, 'above')).toBe(200);
        expect(kbqResolveAvailablePanelMaxHeight(cramped, 'above', undefined, 128)).toBeNull();
    });

    it('should leave the default cap in force for untrusted geometry', () => {
        expect(kbqResolveAvailablePanelMaxHeight(context({ triggerTop: 0, triggerBottom: 0 }))).toBeNull();
    });
});

describe('kbqResolveTriggerFirstRowOffset', () => {
    /** A three-row multiline trigger: 1px border + 3px matcher padding + 3 * 24px rows + 2 * 4px gaps. */
    const measurements = (overrides: Partial<KbqTriggerFirstRowMeasurements> = {}): KbqTriggerFirstRowMeasurements => ({
        originTop: 120,
        originBottom: 208,
        listTop: 124,
        listBottom: 204,
        firstRowBottom: 148,
        listScrollTop: 0,
        ...overrides
    });

    it('should measure the trigger cut down to its first row', () => {
        expect(kbqResolveTriggerFirstRowOffset(measurements())).toBe(32);
    });

    it('should report a single-row trigger as its whole height', () => {
        const singleRow = measurements({ originBottom: 152, listBottom: 148 });

        expect(kbqResolveTriggerFirstRowOffset(singleRow)).toBe(32);
    });

    it('should measure the first row of a list that has been scrolled', () => {
        // Under `multilineMaxRows` the rows keep their laid-out position while the container scrolls, so the
        // first row can sit above the container's top edge.
        const scrolled = measurements({ firstRowBottom: 92, listScrollTop: 56 });

        expect(kbqResolveTriggerFirstRowOffset(scrolled)).toBe(32);
    });

    it('should follow the tallest element on the first row', () => {
        // A custom tag template can wrap onto two lines, which makes the row worth more than one tag.
        expect(kbqResolveTriggerFirstRowOffset(measurements({ firstRowBottom: 164 }))).toBe(48);
    });

    it('should reject a collapsed trigger rect', () => {
        const collapsed = measurements({ originTop: 0, originBottom: 0, listTop: 0, listBottom: 0, firstRowBottom: 0 });

        expect(kbqResolveTriggerFirstRowOffset(collapsed)).toBeNull();
    });

    it('should reject geometry that is not finite', () => {
        expect(kbqResolveTriggerFirstRowOffset(measurements({ firstRowBottom: NaN }))).toBeNull();
    });

    it('should keep the chrome a taller suffix adds below the rows', () => {
        // The rows are not the only thing in the trigger. Everything between the list's bottom edge and the
        // trigger's own belongs to a one-row trigger just as much.
        expect(kbqResolveTriggerFirstRowOffset(measurements({ originBottom: 400 }))).toBe(224);
    });

    it('should reject a first row measured taller than the list holding it', () => {
        // Only a bogus measurement produces this, and anchoring past the trigger's own bottom edge would put
        // the panel somewhere that means nothing.
        expect(kbqResolveTriggerFirstRowOffset(measurements({ firstRowBottom: 260 }))).toBeNull();
    });
});

describe('kbqResolveOverlapPanelSpace', () => {
    /** A ten-row trigger at the top of a 640px viewport, as the multiline overflow e2e fixture lays out. */
    const context: KbqPanelSpaceContext = {
        triggerTop: 120,
        triggerBottom: 404,
        viewportHeight: 640,
        viewportMargin: 4,
        chromeHeight: 12
    };

    it('should measure from the first row rather than from the trigger bottom edge', () => {
        expect(kbqResolveOverlapPanelSpace(context, 32)).toBe(472);
        expect(kbqResolvePanelSideSpace(context)?.below).toBe(220);
    });

    it('should reject untrusted geometry', () => {
        // A collapsed trigger is caught upstream by `kbqResolveTriggerFirstRowOffset` — this rect is replaced
        // by the synthetic one-row trigger before it is measured, so a dead viewport is what is left to catch.
        expect(kbqResolveOverlapPanelSpace({ ...context, viewportHeight: 0 }, 32)).toBeNull();
    });
});

describe('kbqShouldAnchorPanelToFirstRow', () => {
    const context: KbqPanelSpaceContext = {
        triggerTop: 120,
        triggerBottom: 404,
        viewportHeight: 640,
        viewportMargin: 4,
        chromeHeight: 12
    };

    const options = (overrides: Partial<KbqPanelAnchorOptions> = {}): KbqPanelAnchorOptions => ({
        firstRowOffset: 32,
        naturalListHeight: 256,
        ...overrides
    });

    /** The trigger's height comes from the context rect, so shrinking it means moving its bottom edge. */
    const withTriggerHeight = (height: number): KbqPanelSpaceContext => ({
        ...context,
        triggerBottom: context.triggerTop + height
    });

    it('should anchor a trigger taller than the panel with no room on either side', () => {
        expect(kbqShouldAnchorPanelToFirstRow(context, options())).toBe(true);
    });

    it('should leave a single-row trigger alone', () => {
        expect(kbqShouldAnchorPanelToFirstRow(withTriggerHeight(32), options())).toBe(false);
    });

    it('should leave a trigger shorter than the panel alone', () => {
        // 172px of trigger against a 268px panel — the room beside it is the better trade.
        expect(kbqShouldAnchorPanelToFirstRow(withTriggerHeight(172), options())).toBe(false);
    });

    it('should refuse an anchor the panel does not fit in', () => {
        // When no position fits, the overlay falls back to whichever goes off-screen the least. This anchor
        // starts below `above` and over `below`, so it would win that fallback on visible area and overlap a
        // trigger the rule excludes. Refusing it keeps the fallback ranking untouched.
        const cramped: KbqPanelSpaceContext = { ...context, triggerTop: 50, triggerBottom: 138, viewportHeight: 300 };

        expect(kbqShouldAnchorPanelToFirstRow(cramped, options())).toBe(false);
    });

    it('should refuse an anchor above the top of the viewport', () => {
        const scrolledPast: KbqPanelSpaceContext = { ...context, triggerTop: -40, triggerBottom: 244 };

        expect(kbqShouldAnchorPanelToFirstRow(scrolledPast, options())).toBe(false);
    });

    it('should hold an anchored panel through one row of shrinkage', () => {
        const shrunk = withTriggerHeight(256);

        expect(kbqShouldAnchorPanelToFirstRow(shrunk, options({ anchored: true }))).toBe(true);
        expect(kbqShouldAnchorPanelToFirstRow(shrunk, options())).toBe(false);
    });

    it('should release an anchored panel that has shrunk past the whole band', () => {
        expect(kbqShouldAnchorPanelToFirstRow(withTriggerHeight(230), options({ anchored: true }))).toBe(false);
    });

    it('should refuse when the first row cannot be measured', () => {
        expect(kbqShouldAnchorPanelToFirstRow(context, options({ firstRowOffset: null }))).toBe(false);
    });

    it('should refuse untrusted geometry', () => {
        expect(kbqShouldAnchorPanelToFirstRow({ ...context, triggerBottom: context.triggerTop }, options())).toBe(
            false
        );
        expect(kbqShouldAnchorPanelToFirstRow({ ...context, viewportHeight: 0 }, options())).toBe(false);
    });
});
