/**
 * Data for the `textarea-signals` migration.
 *
 * `KbqTextarea` implements `KbqFormFieldControl`, which declares `value`, `id`, `placeholder`,
 * `required`, `disabled`, `focused`, `empty` and `errorState` as plain members — so those stay plain
 * accessors. What moved are the inputs that belong to the textarea itself.
 *
 * - `textarea.canGrow` → a signal whose value changed: the getter folded in the row limit (warn)
 * - `textarea.maxRows` / `freeRowsHeight` / `maxRowLimitReached` → calls (value unchanged — auto-fixed)
 * - `textarea.freeRowsHeight = …` → the input is read-only now (warn)
 */

/** Members whose value is unchanged; a read must become a call. Auto-fixed. */
export const SIGNAL_MEMBERS: readonly string[] = ['maxRows', 'freeRowsHeight', 'maxRowLimitReached'];

/**
 * Signal members that are writable via `.set(...)`. Every migrated member is an `input()` or a read-only
 * `computed`, so this is empty — a programmatic write is left untouched and becomes a compile error.
 */
export const WRITABLE_MEMBERS: ReadonlySet<string> = new Set<string>();

/** TypeScript type annotation that marks a receiver as a textarea. */
export const TEXTAREA_TYPE = 'KbqTextarea';

/** Import specifier that marks a file as a textarea consumer. */
export const TEXTAREA_PACKAGE = '@koobiq/components/textarea';

/**
 * `canGrow` became a read-only `InputSignal` AND changed its value: the getter used to return
 * `!maxRowLimitReached && bound`, so it reported `false` once the textarea hit `maxRows` even though the
 * consumer had asked for growth. It reports what was bound now — a mechanical `()` append would compile
 * and hand back a different boolean.
 */
export const VALUE_CHANGED_MEMBERS: readonly string[] = ['canGrow'];

export interface WarnPattern {
    /** Owner of the member. The pattern is only evaluated for files that also name it. */
    anchor: string;
    pattern: string;
    message: string;
}

const TEXTAREA_ANCHOR = '\\bKbqTextarea\\b';

export const warnPatterns: WarnPattern[] = [
    {
        anchor: TEXTAREA_ANCHOR,
        pattern: '\\.\\s*(?:freeRowsHeight|maxRows|canGrow)\\s*=[^=]',
        message:
            'KbqTextarea.canGrow, maxRows and freeRowsHeight are read-only signal inputs now, so a ' +
            'programmatic write no longer compiles. Bind them in the template instead. `freeRowsHeight` in ' +
            'particular used to be written by the textarea itself on init, which is why the automated ' +
            'migration skipped it.'
    },
    {
        anchor: TEXTAREA_ANCHOR,
        pattern: '(?:viewChild|ViewChild|contentChild|ContentChild)[^\\n;]*\\bKbqTextarea\\b',
        message:
            'A KbqTextarea view/content query returns the directive instance, whose `maxRows` and ' +
            '`maxRowLimitReached` are now signals — reading one is a double call, e.g. ' +
            '`this.textarea().maxRows()`. Verify query reads manually.'
    }
];

/** Printed once per project, after the per-file reports. */
export const SUMMARY = [
    '  `maxRows` and `freeRowsHeight` report `number | undefined` instead of `number`. Both were declared ' +
        'non-nullable while an unbound textarea held `undefined`, and `maxRowLimitReached` compared against ' +
        'it — `rowsCount > undefined` is false, which is why unlimited growth worked at all.',
    '  `freeRowsHeight` no longer writes itself. It defaulted to the measured line height by assigning its ' +
        'own input in `ngOnInit`; the fallback is a computed now, so binding it later actually takes effect ' +
        'instead of being overwritten on the next init.',
    '  The `kbq-textarea_max-row-limit-reached` class follows the row count directly. It is derived from a ' +
        'signal written inside `runOutsideAngular`, so the class used to wait for an unrelated change ' +
        'detection pass to appear.',
    '  Generated ids come from the CDK `_IdGenerator`, so their shape changed from `kbq-textarea-1` to ' +
        '`kbq-textarea-a1` — the app id is part of the prefix now, which keeps two Angular apps on one page ' +
        'from colliding.'
];
