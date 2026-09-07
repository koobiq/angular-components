/**
 * Data for the `progress-spinner-signals` migration.
 *
 * `size` was the last accessor input on the spinner. Its setter also computed the SVG circle radius, which is
 * why the automated signal migration skipped it; the radius is a `computed` now and the input is a plain
 * `input()`.
 *
 * - `spinner.size` → `spinner.size()` (value unchanged — auto-fixed)
 * - `spinner.id` / `value` / `mode` → the same (auto-fixed)
 * - `spinner.svgCircleRadius` / `percentage` / `dashOffsetPercent` → `protected` (warn)
 *
 * `id`, `value` and `mode` became `input()` in 20.0.0, not 20.2.0, and no migration ever covered them.
 * This schematic is registered for `20.3.0-0`, so it runs for a v19 → v20.3 upgrade and is the only place
 * those reads are ever rewritten.
 */

/** Members of `KbqProgressSpinner` whose value is unchanged; a read must become a call. Auto-fixed. */
export const SIGNAL_MEMBERS: readonly string[] = ['size', 'id', 'value', 'mode'];

/**
 * Signal members that are writable via `.set(...)`. Every one of them is `input()` (read-only), so this is
 * empty — a programmatic write is left untouched and becomes a compile error the consumer fixes by hand.
 */
export const WRITABLE_MEMBERS: ReadonlySet<string> = new Set<string>();

/** TypeScript type annotation that marks a receiver as a progress spinner. */
export const SPINNER_TYPE = 'KbqProgressSpinner';

/** Element selector whose template reference variables (`#ref`) point at a progress spinner. */
export const SPINNER_ELEMENT = 'kbq-progress-spinner';

/** Import specifier that marks a file as a progress spinner consumer. */
export const SPINNER_PACKAGE = '@koobiq/components/progress-spinner';

/** Members that moved from `public` to `protected` and can no longer be read from outside the component. */
export const PROTECTED_MEMBERS: readonly string[] = ['svgCircleRadius', 'percentage', 'dashOffsetPercent'];

export interface WarnPattern {
    /** Owner of the member. The pattern is only evaluated for files that also name it. */
    anchor: string;
    pattern: string;
    message: string;
}

const SPINNER_ANCHOR = '\\bKbqProgressSpinner\\w*\\b';

export const warnPatterns: WarnPattern[] = [
    {
        anchor: SPINNER_ANCHOR,
        // The signal-query form only. `@ViewChild(KbqProgressSpinner) s: KbqProgressSpinner` is a plain
        // annotated field that the receiver pass resolves and rewrites to a single call, so telling the
        // reader it needs a double call there would break working code. Whitespace rather than `[^\n;]`,
        // so a prettier-wrapped call is matched too.
        pattern:
            '\\b(?:viewChild|contentChild)(?:\\s*\\.\\s*required)?\\s*(?:<[^<>()]*>)?\\s*\\(\\s*KbqProgressSpinner\\b',
        message:
            'A `viewChild(KbqProgressSpinner)` / `contentChild(KbqProgressSpinner)` query is itself a signal, ' +
            'so reading a spinner signal through it is a double call: `this.spinner().size()`. Those reads are ' +
            'resolved and rewritten where the query is assigned to a field; check any other shape by hand.'
    }
];

/** Reported when a template renders the spinner but cannot be parsed, so nothing in it was inspected. */
export const UNPARSEABLE_TEMPLATE_MESSAGE =
    'This template renders <kbq-progress-spinner> but could not be parsed, so it was left untouched. ' +
    'Migrate reads through its template reference variables by hand.';

/**
 * Reported when a file names the spinner in a type position the receiver pass cannot scope to a single
 * identifier - a union, an array, a `QueryList<…>`, a cast, a return type - or reads a member in a shape
 * the access pass cannot reach. Those reads are left alone, and staying silent reads as "nothing to do".
 */
export const UNRESOLVED_RECEIVER_MESSAGE =
    'KbqProgressSpinner is used here in a way this migration cannot resolve to a single receiver, so any ' +
    'signal read through it was left untouched. Check these lines by hand:';

/** Appended to the protected-members report, in both the TypeScript and the template pass. */
export const PROTECTED_HINT =
    'They are internals of the spinner: the radius, the clamped fraction and the stroke offset are derived ' +
    'from `size` and `value`, so bind those instead of reading the derived values.';

/** Printed once per project, after the per-file reports. */
export const SUMMARY = [
    "  `size` no longer accepts an arbitrary string: it is typed `ProgressSpinnerSize` ('compact' | 'big'), " +
        'resolving a TODO that predates the component review. Any other value used to fall through to the ' +
        'compact radius silently; it is a template type error now.',
    '  `value` is a `numberAttribute` input with a 0 fallback. `value="40"` used to pass the string "40", ' +
        'which the percentage arithmetic coerced by accident; it is a number now, and anything that is not a ' +
        'number reads as 0 rather than reaching the stroke offset as NaN.',
    '  `id`, `value` and `mode` became signal inputs back in 20.0.0 and no migration has covered them until ' +
        'now, so their reads are rewritten here too. A read left un-called is silent: `spinner.value > 50` is ' +
        'always false and `{{ spinner.value }}` prints the function source.'
];
