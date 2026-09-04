/**
 * Data for the `timepicker-signals` migration.
 *
 * `KbqTimepicker` implements `KbqFormFieldControl`, which declares `value`, `id`, `placeholder`,
 * `required`, `disabled`, `focused`, `empty` and `errorState` as plain members — so those stay plain
 * accessors. The four inputs the timepicker owns are signals now.
 *
 * - `timepicker.format` → `timepicker.format()` (value unchanged — auto-fixed)
 * - `timepicker.min` / `max` → signals whose value changed: the getters returned the parsed date (warn)
 * - `kbqValidationTooltip` → a plain input driven by an effect that finally unsubscribes (warn on writes)
 */

/** Members whose value is unchanged; a read must become a call. Auto-fixed. */
export const SIGNAL_MEMBERS: readonly string[] = ['format'];

/**
 * Signal members that are writable via `.set(...)`. Every migrated member is an `input()`, so this is
 * empty — a programmatic write is left untouched and becomes a compile error.
 */
export const WRITABLE_MEMBERS: ReadonlySet<string> = new Set<string>();

/** TypeScript type annotation that marks a receiver as a timepicker. */
export const TIMEPICKER_TYPE = 'KbqTimepicker';

/** Import specifier that marks a file as a timepicker consumer. */
export const TIMEPICKER_PACKAGE = '@koobiq/components/timepicker';

/**
 * `min` and `max` became read-only `InputSignal`s AND changed their value: the getters returned
 * `getValidDateOrNull(dateAdapter.deserialize(bound))`, so an unparseable bound value read back as `null`.
 * They report what was bound now; the parsed values stay internal and still drive the validators.
 */
export const VALUE_CHANGED_MEMBERS: readonly string[] = ['min', 'max'];

export interface WarnPattern {
    /** Owner of the member. The pattern is only evaluated for files that also name it. */
    anchor: string;
    pattern: string;
    message: string;
}

const TIMEPICKER_ANCHOR = '\\bKbqTimepicker\\b';

export const warnPatterns: WarnPattern[] = [
    {
        anchor: TIMEPICKER_ANCHOR,
        pattern: '\\.\\s*(?:format|min|max|kbqValidationTooltip)\\s*=[^=]',
        message:
            'KbqTimepicker.format, min, max and kbqValidationTooltip are read-only signal inputs now, so a ' +
            'programmatic write no longer compiles. Bind them in the template instead.'
    },
    {
        anchor: TIMEPICKER_ANCHOR,
        pattern: '(?:viewChild|ViewChild|contentChild|ContentChild)[^\\n;]*\\bKbqTimepicker\\b',
        message:
            'A KbqTimepicker view/content query returns the directive instance, whose `format`, `min` and ' +
            '`max` are now signals — reading one is a double call, e.g. `this.timepicker().format()`. ' +
            'Verify query reads manually.'
    }
];

/** Printed once per project, after the per-file reports. */
export const SUMMARY = [
    '  `kbqValidationTooltip` unsubscribes. The setter subscribed to `incorrectInput` every time it ran ' +
        'and never unsubscribed, so re-binding the input stacked another subscription and the last one ' +
        'outlived the directive. It is an effect with a teardown now.',
    '  A locale change reformats the rendered time even when the placeholder was set by the consumer. The ' +
        'effect used to return early on a consumer-provided placeholder, which skipped the reformat with ' +
        'it — the two are separate concerns now.',
    '  Generated ids come from the CDK `_IdGenerator`, so their shape changed from `kbq-timepicker-1` to ' +
        '`kbq-timepicker-a1` — the app id is part of the prefix, which keeps two Angular apps on one page ' +
        'from colliding.'
];
