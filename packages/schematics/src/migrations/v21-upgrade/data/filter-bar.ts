import type { AreaData } from '../data';

const FILTER_BAR = '@koobiq/components/filter-bar';

/** The rest of a named import or re-export clause of the filter bar entry point. */
const FILTER_BAR_CLAUSE_END = `(?=[^}]*\\}\\s*from\\s*['"]${FILTER_BAR}['"])`;

/** Removed in 21.0.0: KbqFilterBar.changes, KbqFilterBarRefresher and the pipe min-width directive. */
export const filterBar: AreaData = {
    tsReplacements: [
        { from: '\\bKbqFilterBarRefresher\\b', to: 'KbqFilterRefresher' },
        {
            // A clause that imported both names now holds `KbqFilterRefresher` twice; keep the last one.
            from: `([{,]\\s*)KbqFilterRefresher\\s*,\\s*(?=(?:[\\w\\s,]*,\\s*)?KbqFilterRefresher\\b(?!\\s+as\\b)[\\w\\s,]*\\}\\s*from\\s*['"]${FILTER_BAR}['"])`,
            to: '$1'
        },
        {
            // The specifier, with one of its commas; an emptied clause is dropped by `removeImport`.
            from: `((?:import|export)\\s*(?:type\\s+)?\\{[^}]*?)(?:,\\s*KbqPipeMinWidth\\b(?!\\s+as\\b)|\\bKbqPipeMinWidth\\s*,\\s*|\\bKbqPipeMinWidth\\b(?!\\s+as\\b))${FILTER_BAR_CLAUSE_END}`,
            to: '$1',
            removeImport: { symbol: 'KbqPipeMinWidth', from: FILTER_BAR }
        },
        // An element of an `imports` array: the first or a middle one, the last one, the only one.
        { from: '([\\[,]\\s*)KbqPipeMinWidth\\s*,\\s*', to: '$1' },
        { from: ',\\s*KbqPipeMinWidth(\\s*\\])', to: '$1' },
        { from: '\\[\\s*KbqPipeMinWidth\\s*\\]', to: '[]' }
    ],
    templateReplacements: [{ from: `\\s+kbqPipeMinWidth(?:\\s*=\\s*(?:"[^"]*"|'[^']*'))?(\\s|/?>)`, to: '$1' }],
    warnPatterns: [
        {
            anchor: '\\bKbqFilterBar\\b',
            pattern: '\\.changes\\b',
            message:
                'KbqFilterBar.changes was removed in 21.0.0; it never emitted. If this `.changes` is the filter ' +
                "bar's, read `filterBar.filter()` inside an `effect(...)` or listen to `(filterChange)`."
        },
        {
            // Import specifiers and array elements are removed by the rewrites above.
            pattern: '\\bKbqPipeMinWidth\\b(?!\\s*[,\\]}])',
            message:
                'KbqPipeMinWidth (kbqPipeMinWidth) was removed in 21.0.0 without a replacement: a pipe lays its ' +
                'name and value out as shrinkable grid tracks, which keeps a short part intact. Remove this reference.'
        }
    ]
};
