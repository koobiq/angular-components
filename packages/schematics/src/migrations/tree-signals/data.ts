/**
 * Data for the `tree-signals` migration.
 *
 * Six public members of `@koobiq/components/tree` became read-only when the tree moved to signals:
 *
 * - `KbqTreeNodeToggle.disabled`        — accessor pair → getter over a `computed()` (the input is
 *   declared as `disabledInput` and still aliased `disabled`, so templates are unaffected)
 * - `KbqTreeBase.nodeDefs`              — `QueryList<KbqTreeNodeDef<T>>` → `Signal<readonly KbqTreeNodeDef<T>[]>`
 * - `KbqTreeNodePadding.indent`         — accessor pair → `InputSignal<number | string>`
 * - `KbqTreeNodePadding.indentUnits`    — writable field → getter derived from `indent`
 * - `KbqTreeNodeToggleBaseDirective.recursive` — accessor pair → `InputSignalWithTransform`
 * - `KbqTreeOption.onFocus` / `onBlur`  — `Subject` → `Observable` via `asObservable()`
 *
 * Nothing is rewritten. What replaces a write is a template binding or a different member, and
 * neither can be derived from the assignment; a read of a signal-backed member has to be checked
 * against its new value rather than mechanically suffixed with `()`.
 */

/** Import specifier that marks a file as a tree consumer. */
export const TREE_PACKAGE = '@koobiq/components/tree';

/** Identifier shape that marks a file as a tree consumer without an import (e.g. a re-export). */
export const TREE_TYPE = '\\bKbqTree\\w*\\b';

export interface WarnPattern {
    /** Owner of the member. The pattern is only evaluated for files that also name it. */
    anchor: string;
    /** The call sites the narrowing breaks. */
    pattern: string;
    message: string;
}

const TOGGLE_ANCHOR = '\\bKbqTreeNodeToggle\\w*\\b';

/**
 * Reported with the file they were found in, in every mode — the migration only ever warns.
 * Scoped by `anchor` so a plain `.disabled =` in a file that never mentions a toggle stays quiet.
 */
export const warnPatterns: WarnPattern[] = [
    {
        anchor: TOGGLE_ANCHOR,
        pattern: '\\.disabled\\s*=(?!=)',
        message:
            'KbqTreeNodeToggle.disabled is a read-only getter over a computed (the `disabled` input OR-ed with ' +
            'the filter state), so an assignment throws `TypeError: Cannot set property disabled`. Bind the ' +
            '`disabled` attribute instead — it still reaches the toggle, through the `disabledInput` input.'
    },
    {
        anchor: TOGGLE_ANCHOR,
        pattern: '\\.recursive\\b',
        message:
            'KbqTreeNodeToggleBaseDirective.recursive is an InputSignalWithTransform: read it as `recursive()`, ' +
            'and set it through the `kbqTreeNodeToggleRecursive` binding — assigning to it throws.'
    },
    {
        anchor: TREE_TYPE,
        pattern: '\\bnodeDefs\\s*\\.\\s*(?:changes|first|last|toArray|notifyOnChanges|reset|length)\\b',
        message:
            'KbqTreeBase.nodeDefs is a Signal<readonly KbqTreeNodeDef<T>[]> instead of a QueryList. ' +
            '`nodeDefs.changes` no longer exists, and `nodeDefs.length` is the arity of the signal function — ' +
            'always 0. Read the array as `nodeDefs()` and use `toSignal`/`effect` where you subscribed.'
    },
    {
        anchor: '\\bKbqTreeNodePadding\\b',
        pattern: '\\.indent(?:Units)?\\b',
        message:
            'KbqTreeNodePadding.indent is an InputSignal — read it as `indent()` and set it through the ' +
            '`kbqTreeNodePaddingIndent` binding — and `indentUnits` is a read-only getter derived from it. ' +
            'Assigning to either throws.'
    },
    {
        anchor: '\\bKbqTreeOption\\b',
        pattern: '\\.(?:onFocus|onBlur)\\s*\\.\\s*(?:next|complete|error)\\b',
        message:
            'KbqTreeOption.onFocus and onBlur are Observables now (`asObservable()`), so `.next()` is gone at ' +
            'runtime as well as in the types. Subscribe to them; the option emits on them itself.'
    }
];

/**
 * Printed once for every project that renders a tree, because five of the six narrowings are only
 * visible at a call site that writes the member — a consumer that merely reads one gets a value
 * whose type changed under it and no diagnostic at all.
 */
export const SUMMARY: string[] = [
    '',
    'These members of @koobiq/components/tree became read-only and cannot be assigned:',
    '  - KbqTreeNodeToggle.disabled (bind `disabled`; the input is declared as `disabledInput`)',
    '  - KbqTreeBase.nodeDefs (Signal<readonly KbqTreeNodeDef<T>[]>, no longer a QueryList)',
    '  - KbqTreeNodePadding.indent (InputSignal) and KbqTreeNodePadding.indentUnits (getter)',
    '  - KbqTreeNodeToggleBaseDirective.recursive (InputSignalWithTransform)',
    '  - KbqTreeOption.onFocus and KbqTreeOption.onBlur (Observable, not Subject)'
];
