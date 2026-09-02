/**
 * Data for the `loader-overlay-signals` migration.
 *
 * `text` and `caption` were the two inputs the automated signal migration skipped, because they are read
 * inside `@if` blocks and it would not risk the narrowing. They are `input()` now, and honest about being
 * optional: both were declared `string` over a field with no initializer, so an overlay that bound neither
 * reported `undefined` from a non-nullable type.
 *
 * - `overlay.text` / `overlay.caption` → calls (value unchanged — auto-fixed)
 * - the template helpers and the content queries → `protected` / `private` (warn)
 *
 * `size`, `transparent` and `card` were already signals in 20.2.0 and need no rewrite; `transparent` only
 * gained a `booleanAttribute` transform, which is reported rather than rewritten.
 */

/** Members of `KbqLoaderOverlay` whose value is unchanged; a read must become a call. Auto-fixed. */
export const SIGNAL_MEMBERS: readonly string[] = ['text', 'caption'];

/**
 * Signal members that are writable via `.set(...)`. Every `KbqLoaderOverlay` signal is `input()`
 * (read-only), so this is empty — a programmatic write is left untouched and becomes a compile error.
 */
export const WRITABLE_MEMBERS: ReadonlySet<string> = new Set<string>();

/** TypeScript type annotation that marks a receiver as a loader overlay. */
export const OVERLAY_TYPE = 'KbqLoaderOverlay';

/** Element selector whose template reference variables (`#ref`) point at a loader overlay. */
export const OVERLAY_ELEMENT = 'kbq-loader-overlay';

/** Import specifier that marks a file as a loader overlay consumer. */
export const OVERLAY_PACKAGE = '@koobiq/components/loader-overlay';

/** Members that moved out of the public surface and can no longer be read from outside the component. */
export const PROTECTED_MEMBERS: readonly string[] = [
    'isExternalIndicator',
    'isExternalText',
    'isExternalCaption',
    'isEmpty',
    'spinnerSize',
    'externalIndicator',
    'externalText',
    'externalCaption'
];

/** Appended to the protected-members warning. */
export const PROTECTED_HINT =
    'They are the template helpers behind the projection slots: what the overlay renders is the contract, ' +
    'not how it decides. Read the DOM, or track the projected content yourself.';

export interface WarnPattern {
    /** Owner of the member. The pattern is only evaluated for files that also name it. */
    anchor: string;
    pattern: string;
    message: string;
}

export const warnPatterns: WarnPattern[] = [
    {
        anchor: '\\bKbqLoaderOverlay\\b',
        pattern: '(?:viewChild|ViewChild|contentChild|ContentChild)[^\\n;]*\\bKbqLoaderOverlay\\b',
        message:
            'A KbqLoaderOverlay view/content query returns the component instance, whose `text` and `caption` ' +
            'are now signals — reading one is a double call, e.g. `this.overlay().text()`. Verify query reads ' +
            'manually.'
    }
];

/** Printed once per project, after the per-file reports. */
export const SUMMARY = [
    '  `text` and `caption` report `string | undefined` instead of `string`. Both were declared non-nullable ' +
        'over a field with no initializer, so an overlay that bound neither always handed back `undefined` — ' +
        'the call sites that were already wrong now fail to compile.',
    '  `transparent` is a `booleanAttribute` input. <kbq-loader-overlay transparent> used to pass the empty ' +
        'string, which is falsy, so the valueless attribute rendered the *filled* background — the opposite ' +
        'of what it reads as. It means true now, and [transparent]="\'false\'" means false.'
];
