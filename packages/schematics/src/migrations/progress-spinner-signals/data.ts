/**
 * Data for the `progress-spinner-signals` migration.
 *
 * `size` was the last accessor input on the spinner. Its setter also computed the SVG circle radius, which is
 * why the automated signal migration skipped it; the radius is a `computed` now and the input is a plain
 * `input()`.
 *
 * - `spinner.size` → `spinner.size()` (value unchanged — auto-fixed)
 * - `spinner.svgCircleRadius` / `percentage` / `dashOffsetPercent` → `protected` (warn)
 *
 * `id`, `value` and `mode` were already signals in 20.2.0 and are not touched here.
 */

/** Members of `KbqProgressSpinner` whose value is unchanged; a read must become a call. Auto-fixed. */
export const SIGNAL_MEMBERS: readonly string[] = ['size'];

/**
 * Signal members that are writable via `.set(...)`. `size` is `input()` (read-only), so this is empty — a
 * programmatic write is left untouched and becomes a compile error the consumer fixes by hand.
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

export const warnPatterns: WarnPattern[] = [
    {
        anchor: '\\bKbqProgressSpinner\\b',
        pattern: '(?:viewChild|ViewChild|contentChild|ContentChild)[^\\n;]*\\bKbqProgressSpinner\\b',
        message:
            'A KbqProgressSpinner view/content query returns the component instance, whose `size` is now a ' +
            'signal — reading it is a double call, e.g. `this.spinner().size()`. Verify query reads manually.'
    }
];

/** Printed once per project, after the per-file reports. */
export const SUMMARY = [
    "  `size` no longer accepts an arbitrary string: it is typed `ProgressSpinnerSize` ('compact' | 'big'), " +
        'resolving a TODO that predates the component review. Any other value used to fall through to the ' +
        'compact radius silently; it is a template type error now.',
    '  `value` is a `numberAttribute` input. `value="40"` used to pass the string "40", which the percentage ' +
        'arithmetic coerced by accident; it is a number now. A binding that passes null or undefined used to ' +
        'clamp to 0 and now yields NaN, so bind a number or leave the input unbound.'
];
