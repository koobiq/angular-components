/**
 * Data for the `filter-bar-state-saving-default` migration.
 *
 * `KbqFilterBar` remembers which filter is selected and the edits made to it now, and `useStateSaving`
 * defaults to `true`. Unlike the components that shipped before it, the bar restores over the value a
 * `[filter]` binding supplied at initialization — it writes through the `filter` model, so `filterChange`
 * fires and the application loads data for the restored filter. That is the part a consumer has to act
 * on, and it is exactly the markup that says nothing about the input.
 *
 * Warn-only. Rewriting the markup to `[useStateSaving]="false"` would withhold the feature this release
 * is shipping.
 */

/** Import specifiers that mark a file as a consumer of the filter bar. */
export const PACKAGES = ['@koobiq/components/filter-bar'];

/** Identifier and element shapes that mark a consumer without an import. */
export const CONSUMER_TYPE = '\\bKbqFilterBar\\b|\\bkbq-filter-bar\\b';

export interface WarnPattern {
    /** Owner of the change. The pattern is only evaluated for files that also name it. */
    anchor: string;
    /** The markup or call sites the change reaches. */
    pattern: string;
    /** When present, the file is skipped if this matches — for reporting an absence. */
    unless?: string;
    message: string;
}

const FILTER_BAR = '<kbq-filter-bar\\b|\\[kbq-filter-bar\\]';

/**
 * Anything that makes a file a consumer, for the reports that key off a call site rather than off the
 * rendered element — pipe templates are routinely declared in a `.ts` whose markup lives elsewhere.
 */
const CONSUMER = `${CONSUMER_TYPE}|\\bKbqPipeTemplate\\b|@koobiq/components/filter-bar`;

export const warnPatterns: WarnPattern[] = [
    {
        anchor: FILTER_BAR,
        pattern: FILTER_BAR,
        unless: '\\buseStateSaving\\b',
        message:
            'Filter bars remember the selected filter and the edits made to it by default now: ' +
            'useStateSaving defaults to true. Pass [useStateSaving]="false" to keep the previous ' +
            'behaviour. What is stored is the filter name, whether it carried unsaved changes, and one ' +
            'entry per pipe — its id (or name) and its value.'
    },
    {
        anchor: FILTER_BAR,
        pattern: '\\[\\(?filter\\)?\\]',
        unless: '\\buseStateSaving\\b',
        message:
            'A restored filter overrides the value this [filter] binding supplies at initialization, and ' +
            'writes through the model, so filterChange fires and the application fetches for it as it ' +
            'would for one the user had picked. Only a later change wins — this is the one place the bar ' +
            'differs from the components that persist a controlled input by leaving it alone.'
    },
    {
        anchor: FILTER_BAR,
        pattern: '<kbq-filters\\b',
        unless: '\\buseStateSaving\\b',
        message:
            'A filter is identified by its name, the only identity KbqFilter has. Renaming a saved filter ' +
            'therefore loses what was stored for it, and a name that is no longer in the filters list ' +
            'restores nothing. Applications that load their filters from a server are waited for: the ' +
            'restore applies as soon as the named filter appears.'
    },
    {
        anchor: CONSUMER,
        pattern: '\\bcompareWith\\b',
        message:
            'Restored pipe values come back as new objects, never the option instances in the templates. ' +
            'This compareWith is what matches them again — keep it in step with what is stored, which is ' +
            'the value alone.'
    },
    {
        // Programmatic access names the class, which the markup-only anchor does not cover.
        anchor: CONSUMER,
        pattern: '\\.\\s*(saveFilterState|restoreFilterState)\\s*\\(',
        message:
            'saveFilterState()/restoreFilterState() are unchanged: they snapshot the filter in memory ' +
            'within one session. Persistence is separate — clearSavedState() and hasSavedState are the ' +
            'members that reach it, and the bar writes on every change by itself.'
    }
];

/** Printed once, after the per-file reports. */
export const SUMMARY = [
    '  A filter bar rendered inside an overlay does not persist: it is not in the document when it',
    '  initializes and so has no stable key. The key otherwise comes from stateSavingKey, or is derived',
    '  from the position in the document when none is given.',
    '  Pipes are stored as a projection — id and value — and everything else is rebuilt from filters and',
    '  pipeTemplates, because a pipe built from a template keeps that template compareWith and date',
    '  bounds, which do not survive being written to storage. A pipe whose template is gone is left out.',
    '  Storage format: entries are written under a "kbq.state." prefix and carry a timestamp, so an',
    '  entry stranded by a markup change is collected once it outlives KBQ_STATE_SAVING_TTL (90 days by',
    '  default).',
    '  Provide KBQ_STATE_STORE to persist somewhere else (KbqSessionStorageStateStore is bundled), and',
    '  KBQ_STATE_SAVING_KEY_RESOLVER to derive the key from something other than the document position.'
];
