/**
 * Data for the `select-signal-inputs` migration.
 *
 * The select review moved the trigger-label surface to signal inputs and closed the overlay
 * internals:
 *
 * - `hiddenItemsText` — accessor pair → `InputSignal<string | undefined>`.
 * - `hiddenItemsTextFormatter` — a method a subclass could override → an input holding the function.
 * - `overlayDir`, `triggerRect` — public → `protected`.
 * - `onRemoveMatcherItem(option, $event)` — the event parameter is `Event` instead of `any`.
 * - `selectEvents`, and the whole `core/select/events.ts` it lived in, are gone. The module held one
 *   constant whose value equalled its own name and nothing read it.
 *
 * The template surface is untouched: every input keeps its alias, so `[hiddenItemsText]` and
 * `[hiddenItemsTextFormatter]` bind exactly as before. Only programmatic access changed.
 *
 * Warn-only. A read of a signal input becomes a call, a write becomes the binding, and which of the
 * two a call site wants cannot be derived from the expression.
 */

/** Import specifiers that mark a file as a select consumer. */
export const SELECT_PACKAGE = '@koobiq/components/select';

/**
 * Identifier and attribute shapes that mark a consumer without an import. `selectEvents` is in the
 * list because it was exported from `@koobiq/components/core`, so a file importing it need not name
 * the select at all — and that file is exactly the one whose import no longer resolves.
 */
export const SELECT_TYPE = '\\bKbqSelect\\w*\\b|\\bkbq-select\\b|\\bselectEvents\\b';

export interface WarnPattern {
    /** Owner of the member. The pattern is only evaluated for files that also name it. */
    anchor: string;
    /** The call sites the change breaks. */
    pattern: string;
    message: string;
}

export const warnPatterns: WarnPattern[] = [
    {
        anchor: SELECT_TYPE,
        pattern: '\\.\\s*hiddenItemsText\\s*=(?!=)',
        message:
            'KbqSelect.hiddenItemsText is an InputSignal — an input() has no .set(), so the assignment no ' +
            'longer compiles. Bind [hiddenItemsText] in the template instead. The alias is unchanged, so an ' +
            'existing binding needs nothing.'
    },
    {
        anchor: SELECT_TYPE,
        pattern: '\\.\\s*hiddenItemsText\\b(?!\\s*[=(])',
        message:
            'KbqSelect.hiddenItemsText is an InputSignal: read it as `hiddenItemsText()`. Note it reports ' +
            '`string | undefined` — the locale default is applied where the label is built, not in the input.'
    },
    {
        anchor: SELECT_TYPE,
        pattern: '\\.\\s*hiddenItemsTextFormatter\\b',
        message:
            'KbqSelect.hiddenItemsTextFormatter is an input holding the function, not a method. Call it as ' +
            '`hiddenItemsTextFormatter()(template, count)`, and replace an override in a subclass with a ' +
            '[hiddenItemsTextFormatter] binding.'
    },
    {
        anchor: SELECT_TYPE,
        pattern: '\\.\\s*(?:overlayDir|triggerRect)\\b',
        message:
            'KbqSelect.overlayDir and KbqSelect.triggerRect are protected. They are the overlay plumbing; ' +
            'the supported surface is the open/close API and the panel inputs.'
    },
    {
        anchor: '\\bselectEvents\\b|core/select/events',
        pattern: '\\bselectEvents\\b|core/select/events',
        message:
            'selectEvents and the core/select/events module were removed. The module exported one constant ' +
            "whose value equalled its own name ('selectEvents') and nothing read it — delete the import."
    }
];

/** Printed once per project, after the per-file reports. */
export const SUMMARY = [
    '  Multiple mode orders the selection by the panel now. sortValues() was documented as sorting by ' +
        'panel order, but its default comparator was `a.value - b.value` — NaN on string values, which a ' +
        'sort treats as "equal" and so leaves the arrival order in place, and plain numeric order ' +
        'otherwise. The default is the option index in the panel now, and a value with no rendered option ' +
        '(a KbqVirtualOption under virtual scroll, or showPreselectedValues) sorts last. The order is ' +
        'visible in the emitted form value, the trigger tags and the option highlighted on open. A host ' +
        'that re-sorted the emitted value into panel order itself can drop that; to keep another order, ' +
        'bind [sortComparator] — `(a, b) => a.value - b.value` restores the old numeric order, `() => 0` ' +
        'the old arrival order.',
    '  KbqSelect no longer leaks: the locale subscription created in the constructor had no teardown, and ' +
        'a root-provided singleton held every created-then-destroyed select for the lifetime of the app.',
    '  The select finally carries combobox/listbox/option ARIA and a keyboard-operable tag-remove ' +
        'control, so hand-rolled role or aria-* attributes on the host are now duplicates.'
];
