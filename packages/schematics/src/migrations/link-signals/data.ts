/**
 * Data for the `link-signals` migration.
 *
 * The three inputs the automated signal migration skipped were all accessors, and each of them did
 * something beyond storing a value.
 *
 * - `link.disabled` → `link.disabled()` (value unchanged — auto-fixed)
 * - `link.tabIndex` → a signal whose value changed: the getter folded in the disabled state (warn)
 * - `link.print` → was write-only (a setter with no getter), so it has no read to rewrite (warn on writes)
 * - `icons` / `icon` / `hasIcon` / `printMode` / `printUrl` → `protected` / `private` (warn)
 *
 * `disabledSignal` stays a public `WritableSignal<boolean>`: `kbqTooltip` accepts a link through
 * `forDisabledComponent` and reads it, and that contract is typed on the tooltip side.
 */

/** Members of `KbqLink` whose value is unchanged; a read must become a call. Auto-fixed. */
export const SIGNAL_MEMBERS: readonly string[] = ['disabled'];

/**
 * Signal members that are writable via `.set(...)`. Every `KbqLink` signal member is `input()`
 * (read-only), so this is empty — a programmatic write is left untouched and becomes a compile error.
 */
export const WRITABLE_MEMBERS: ReadonlySet<string> = new Set<string>();

/** TypeScript type annotation that marks a receiver as a link. */
export const LINK_TYPE = 'KbqLink';

/** Import specifier that marks a file as a link consumer. */
export const LINK_PACKAGE = '@koobiq/components/link';

/**
 * `tabIndex` became a read-only `InputSignal` AND changed its value: the getter returned `-1` for a
 * disabled link, it now reports what was bound. The host attribute still goes to `-1` while the link is
 * disabled, so nothing about focus behavior changed — only a programmatic read sees the difference, and a
 * mechanical `()` append would silently change it.
 */
export const VALUE_CHANGED_MEMBERS: readonly string[] = ['tabIndex'];

/** Members that moved out of the public surface and can no longer be read from outside the directive. */
export const PROTECTED_MEMBERS: readonly string[] = [
    'icons',
    'icon',
    'hasIcon',
    'printMode',
    'printUrl',
    'nativeElement',
    'destroyRef'
];

/** Appended to the protected-members warning. */
export const PROTECTED_HINT =
    'They are the icon-spacing and print bookkeeping: the classes and the `print` attribute the directive ' +
    'puts on the anchor are the contract, not the state behind them. `icon` is gone \u2014 `icons` already ' +
    'answered the one question it was asked \u2014 `nativeElement` is private (call `getHostElement()`), and ' +
    '`destroyRef` is gone: inject `DestroyRef` yourself if a subclass needs it.';

export interface WarnPattern {
    /** Owner of the member. The pattern is only evaluated for files that also name it. */
    anchor: string;
    pattern: string;
    message: string;
}

const LINK_ANCHOR = '\\bKbqLink\\b';

export const warnPatterns: WarnPattern[] = [
    {
        anchor: LINK_ANCHOR,
        pattern: '\\.\\s*print\\s*=',
        message:
            'KbqLink.print was a write-only input (a setter with no getter) and is an `input()` now, so the ' +
            'write no longer compiles. Bind `[print]` in the template instead. Binding `null` opts out of the ' +
            'printed URL, which is what an unbound link does by default.'
    },
    {
        anchor: LINK_ANCHOR,
        pattern: '(?:viewChild|ViewChild|contentChild|ContentChild)[^\\n;]*\\bKbqLink\\b',
        message:
            'A KbqLink view/content query returns the directive instance, whose `disabled` is now a signal — ' +
            'reading it is a double call, e.g. `this.link().disabled()`. Verify query reads manually.'
    }
];

/** Printed once per project, after the per-file reports. */
export const SUMMARY = [
    '  `print` accepts `string | null` instead of `any`, and `[print]="undefined"` no longer marks the link ' +
        'as printable. The old setter tested `value !== null`, so an explicit `undefined` passed it and added ' +
        '`kbq-link_print` while printing the href; the input tests `!= null`, which covers both. An unbound ' +
        'link behaves exactly as before: no class, and the href still lands in the `print` attribute.',
    '  Reading `disabled` reports the bound input. The effective state — what the host bindings render — is ' +
        "`disabledSignal()`, which stays writable so `kbqTooltip`'s `forDisabledComponent` keeps working. " +
        'The two only differ if something writes `disabledSignal` directly.'
];
