/**
 * Data for the `title-encapsulation` migration.
 *
 * The title review narrowed what `KbqTitleDirective` publishes. Nothing was renamed, so no call site
 * has a mechanical replacement — the members are either gone or no longer reachable from outside:
 *
 * - `resizeStream` — a public `Subject<Event>` fed by a `(window:resize)` host listener. The directive
 *   now injects the CDK `SharedResizeObserver` and re-measures on container resizes by itself, so
 *   there is nothing left to push into.
 * - `hasOnlyText` — public getter → `private`.
 * - `ngOnDestroy` — no longer declared; teardown runs through `takeUntilDestroyed`, and the directive
 *   no longer implements `OnDestroy`.
 * - `child`, `parent`, `isHorizontalOverflown`, `isVerticalOverflown`, `handleElementEnter`,
 *   `hideTooltip` — public → `protected`. `child` additionally returns `HTMLElement | undefined`.
 *
 * Warn-only. A consumer that reached for any of these was reaching into the measurement internals,
 * and what it should do instead depends on why — there is no expression to rewrite it to.
 */

/** Import specifier that marks a file as a title consumer. */
export const TITLE_PACKAGE = '@koobiq/components/title';

/** Identifier shape that marks a consumer without an import (e.g. a re-export or a subclass). */
export const TITLE_TYPE = '\\bKbqTitleDirective\\b';

export interface WarnPattern {
    /** Owner of the member. The pattern is only evaluated for files that also name it. */
    anchor: string;
    /** The call sites the narrowing breaks. */
    pattern: string;
    message: string;
}

const SUBCLASS_ANCHOR = 'extends\\s+KbqTitleDirective\\b';

export const warnPatterns: WarnPattern[] = [
    {
        anchor: TITLE_TYPE,
        pattern: '\\.\\s*resizeStream\\b',
        message:
            'KbqTitleDirective.resizeStream was removed. It was a Subject fed by a (window:resize) host ' +
            'listener; the directive now injects the CDK SharedResizeObserver and re-measures on container ' +
            'resizes on its own, so a manual `resizeStream.next(event)` has no counterpart and is no longer ' +
            'needed. Drop the call.'
    },
    {
        anchor: TITLE_TYPE,
        pattern: '\\.\\s*hasOnlyText\\b',
        message:
            'KbqTitleDirective.hasOnlyText is private. It reported whether the host holds a single text node, ' +
            'which is a detail of the overflow measurement — read the rendered DOM directly if a consumer ' +
            'genuinely needs it.'
    },
    {
        anchor: TITLE_TYPE,
        pattern: '\\.\\s*(?:child|parent|isHorizontalOverflown|isVerticalOverflown|handleElementEnter|hideTooltip)\\b',
        message:
            'KbqTitleDirective.child / parent / isHorizontalOverflown / isVerticalOverflown / ' +
            'handleElementEnter / hideTooltip are protected. They are the measurement internals; the ' +
            'supported surface is the `kbq-title` input and the tooltip the directive opens by itself. ' +
            '`child` additionally returns `HTMLElement | undefined` now.'
    },
    {
        anchor: SUBCLASS_ANCHOR,
        pattern: 'super\\s*\\.\\s*ngOnDestroy\\s*\\(',
        message:
            'KbqTitleDirective no longer declares ngOnDestroy — it tears down through takeUntilDestroyed and ' +
            'no longer implements OnDestroy, so `super.ngOnDestroy()` from a subclass no longer resolves. ' +
            'Remove the call; the base teardown runs on its own.'
    }
];

/** Printed once per project, after the per-file reports. */
export const SUMMARY = [
    '  The tooltip now opens on keyboard focus as the guide always claimed, so a host that compensated ' +
        'for its absence — its own focus listener calling show(), or a duplicate hint — can be removed.',
    '  `titleContent` is typed TemplateRef<unknown> instead of TemplateRef<any>; a TemplateRef<SomeCtx> ' +
        'still assigns, but a value read back out needs a cast.'
];
