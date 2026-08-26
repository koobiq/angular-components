/**
 * Data for the `tooltip-pointer-events-and-types` migration.
 *
 * The tooltip review made one change that reaches consumers without any code to point at, and a set
 * of type narrowings that surface as compile errors:
 *
 * - `ignoreTooltipPointerEvents` defaults to `false` instead of `true`. The pane is hoverable now, so
 *   the pointer can reach it — WCAG 1.4.13 *hoverable* — which also means it captures clicks meant
 *   for whatever it floats over. Nothing in the markup changes, so nothing can be rewritten and
 *   nothing warns on its own: the only handle is "this file renders tooltips and never opts out".
 * - `KbqPopUpTrigger.scheduler` — removed.
 * - `KbqPopUpTrigger.getMouseLeaveListener()` — took an optional delay, now takes nothing.
 * - `placementChange` — `EventEmitter<string>` → `EventEmitter<KbqPopUpPlacementValues>`.
 * - `content`, `header`, `context`, `modifier` — the `any` in their types became `unknown` or the
 *   real enum.
 *
 * Warn-only. A narrowed type is fixed by giving the call site the right type, which cannot be derived
 * from the assignment, and the default flip has no call site at all.
 */

/** Import specifiers that mark a file as a tooltip consumer. */
export const TOOLTIP_PACKAGE = '@koobiq/components/tooltip';

/** Identifier and attribute shapes that mark a consumer without an import. */
export const TOOLTIP_TYPE = '\\bKbqTooltipTrigger\\b|\\bkbqTooltip\\b';

export interface WarnPattern {
    /** Owner of the member. The pattern is only evaluated for files that also name it. */
    anchor: string;
    /** The call sites the change breaks. */
    pattern: string;
    /** When present, the file is skipped if this matches — for reporting an absence. */
    unless?: string;
    message: string;
}

const POP_UP_ANCHOR = '\\bKbqPopUpTrigger\\b|\\bKbqTooltipTrigger\\b|\\bKbqPopoverTrigger\\b';

export const warnPatterns: WarnPattern[] = [
    {
        anchor: '\\bkbqTooltip\\b',
        pattern: '\\bkbqTooltip\\b',
        unless: '\\bignoreTooltipPointerEvents\\b',
        message:
            'Tooltip panes take pointer events now: ignoreTooltipPointerEvents defaults to false instead of ' +
            'true, so the pointer can reach the pane (WCAG 1.4.13 "Content on Hover or Focus") and the pane ' +
            'also captures clicks meant for whatever it floats over. Nothing in this file opts out. Add ' +
            '[ignoreTooltipPointerEvents]="true" to any tooltip that overlays another click target. The ' +
            'built-in overflow hints (kbq-title, kbqEllipsisCenter, option and timezone hints) already opt ' +
            'out, and so does any tooltip whose kbqTrigger is manual or none.'
    },
    {
        anchor: POP_UP_ANCHOR,
        pattern: '\\.\\s*scheduler\\b',
        message:
            'KbqPopUpTrigger.scheduler was removed. It exposed the RxJS AsyncScheduler the trigger used for ' +
            'its own delays; schedule your own work on a scheduler you own.'
    },
    {
        anchor: POP_UP_ANCHOR,
        pattern: 'getMouseLeaveListener\\s*\\(\\s*[^)\\s]',
        message:
            'KbqPopUpTrigger.getMouseLeaveListener() no longer takes a delay — the listener it returns reads ' +
            'the trigger`s own leaveDelay. Drop the argument.'
    },
    {
        anchor: POP_UP_ANCHOR,
        pattern: '\\bplacementChange\\b',
        message:
            'placementChange emits KbqPopUpPlacementValues instead of string. A handler declared `(p: string)` ' +
            'no longer matches; widen it to the union, or to KbqPopUpPlacementValues.'
    },
    {
        anchor: TOOLTIP_TYPE,
        pattern: '\\.\\s*(?:content|header|context|modifier)\\b',
        message:
            'The `any` left the tooltip inputs: content and header are `string | TemplateRef<unknown>`, ' +
            'context is `unknown`, and modifier is KbqEnumValues<TooltipModifier>. Assigning still works; a ' +
            'value read back out needs a cast, and a modifier written as a free-form string has to be one of ' +
            'the enum members.'
    }
];

/** Printed once per project, after the per-file reports. */
export const SUMMARY = [
    '  The tooltip now carries role="tooltip" and the trigger points aria-describedby at it, so a host ' +
        'that added either by hand can drop it.',
    '  Escape closes a hover tooltip on a non-focusable element, which previously only worked while the ' +
        'trigger itself had focus.',
    '  KbqTooltipTrigger can be imported standalone: KBQ_TOOLTIP_SCROLL_STRATEGY has a factory default, ' +
        'so the NgModule is no longer load-bearing.'
];
