/**
 * Data for the `filter-bar-signals` migration.
 *
 * `KbqFilterBar` moved several members from accessors/getters to signals. Reading them programmatically
 * (in `.ts` code or via a template reference variable) now requires a call:
 *
 * - `filterBar.filter`            → `filterBar.filter()`            (write `= v` → `.set(v)`)
 * - `filterBar.pipeTemplates`     → `filterBar.pipeTemplates()`
 * - `filterBar.isChanged`         → `filterBar.isChanged()`        (also isDisabled/isReadOnly/isSaved/isSavedAndChanged)
 *
 * Template *bindings* (`[filter]`, `[(filter)]`, `[pipeTemplates]`) keep working — only reads break.
 */

/** Members of `KbqFilterBar` that became signals; a read of any of them must become a call. */
export const SIGNAL_MEMBERS: readonly string[] = [
    'filter',
    'pipeTemplates',
    'isChanged',
    'isDisabled',
    'isReadOnly',
    'isSaved',
    'isSavedAndChanged'
];

/** Signal members that are writable (`model()`); `x.filter = v` migrates to `x.filter.set(v)`. */
export const WRITABLE_MEMBERS: ReadonlySet<string> = new Set(['filter']);

/** TypeScript type annotations that mark a receiver as a filter bar. */
export const FILTER_BAR_TYPE = 'KbqFilterBar';
export const FILTER_BAR_HOST_TYPE = 'KbqFilterBarHost';

/** Element selector whose template reference variables (`#ref`) point at a filter bar. */
export const FILTER_BAR_ELEMENT = 'kbq-filter-bar';

export interface Replacement {
    from: string;
    to: string;
}

/**
 * Safe, idempotent identifier renames applied to `.ts` files. The `\b…\b` boundaries make each rule
 * idempotent. `KbqFilterBarRefresher` is still re-exported as an alias of `KbqFilterRefresher`, so this
 * is optional cleanup that can never break a consumer build.
 */
export const tsRenameReplacements: Replacement[] = [{ from: '\\bKbqFilterBarRefresher\\b', to: 'KbqFilterRefresher' }];

export interface WarnPattern {
    pattern: string;
    message: string;
}

/**
 * Patterns that can't be auto-fixed reliably — surfaced with file locations (in both `fix` and dry-run
 * mode). Only evaluated for files that reference the filter bar, so the broad `.changes` pattern stays scoped.
 */
export const warnPatterns: WarnPattern[] = [
    {
        pattern: '\\.changes\\b',
        message:
            'KbqFilterBar.changes is deprecated and no longer emits. Reactivity is driven by the `filter` ' +
            'signal now — read it with `filterBar.filter()` inside an `effect(...)`, or listen to the ' +
            '`(filterChange)` output. (Best-effort match — ignore if this `.changes` is unrelated.)'
    },
    {
        pattern: '\\.preparePopover\\(',
        message:
            'KbqFilters.preparePopover() was removed. Use openSaveAsNewFilterPopover() / ' +
            'openChangeFilterNamePopover() instead.'
    },
    {
        pattern: '(?:viewChild|ViewChild)[^\\n;]*\\bKbqFilterBar\\b',
        message:
            'A KbqFilterBar view/signal query returns the component instance, whose filter is now a signal — ' +
            'reading it is a double call, e.g. `this.filterBar().filter()`. Verify query reads manually.'
    },
    {
        pattern: '\\bKBQ_FILTER_BAR_PIPES\\b',
        message:
            'KBQ_FILTER_BAR_PIPES is now typed as Map<KbqPipeType, Type<KbqBasePipe>> (was an array of tuples). ' +
            'If you provide it directly, wrap the entries in `new Map([...])`.'
    }
];
