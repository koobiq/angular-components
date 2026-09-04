/**
 * Data for the `dl-attribute-coercion` migration.
 *
 * `KbqDlComponent` was already fully signal-based; the review found the five inputs that never got a
 * coercion transform, so a static attribute reached them as a string.
 *
 * - `<kbq-dl wide>` passed the empty string, which is falsy — the attribute did nothing
 * - `<kbq-dl vertical>` did the same, and `vertical` is tri-state, so `booleanAttribute` alone would have
 *   folded its `null` "decide from the breakpoint" state into `false`
 * - `minWidth`, `dtMinWidth` and `ddMinWidth` reached the layout arithmetic as strings
 *
 * Warn-only: every one of these is a template change, and which markup relied on the old reading is a
 * decision the call site owns.
 */

/** Import specifier that marks a file as a description list consumer. */
export const DL_PACKAGE = '@koobiq/components/dl';

/** Element selector of the description list. */
export const DL_ELEMENT = 'kbq-dl';

export interface WarnPattern {
    /** Only evaluated for files that also render the element. */
    pattern: string;
    message: string;
}

export const warnPatterns: WarnPattern[] = [
    {
        // A valueless `wide` or `vertical`: the attribute name with no `=` and no `[` prefix.
        pattern: '<kbq-dl[^>]*\\s(?:wide|vertical)(?![\\w-]*\\s*=)',
        message:
            'A valueless `wide` or `vertical` attribute on <kbq-dl> used to pass the empty string, which is ' +
            'falsy, so it did nothing. Both are coerced now and the attribute means true. Remove it if the ' +
            'markup was relying on it being ignored.'
    },
    {
        pattern: '<kbq-dl[^>]*\\s(?:minWidth|dtMinWidth|ddMinWidth)\\s*=\\s*"[^"{]',
        message:
            '`minWidth`, `dtMinWidth` and `ddMinWidth` on <kbq-dl> are numeric inputs now. A static attribute ' +
            'used to reach the layout arithmetic as a string, which happened to coerce in a comparison but ' +
            'not in `Math.max`. The value is a number now; a non-numeric one reads as undefined.'
    }
];

/** Printed once per project, after the per-file reports. */
export const SUMMARY = [
    '  `vertical` keeps `null` as its default — the state that lets the list decide from ' +
        '`verticalBreakpoint` — so it is coerced with a transform that preserves null rather than with ' +
        '`booleanAttribute`, which would have folded it into false.',
    '  `minWidth`, `dtMinWidth` and `ddMinWidth` report `number | undefined`, which is what an unbound ' +
        'description list always held.'
];
