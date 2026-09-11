/**
 * Data for the `tree-state-saving-default` migration.
 *
 * `KbqTreeSelection` and `KbqTree` persist their expanded nodes now, and `useStateSaving` defaults to
 * `true`. A tree that was never configured to persist anything comes back with the branches the user
 * left open, which changes four things a consumer can only find out by reading:
 *
 * - The key is derived from where the tree sits in the document when no `stateSavingKey` is given, so
 *   restructuring the markup above it strands what was saved under the previous key.
 * - Expansion is persisted by the value `FlatTreeControl.getValue` returns, which must therefore be a
 *   stable, unique string rather than something derived from the node's position or object identity.
 * - Expansion the application performs itself is not persisted until something else is.
 * - A `NestedTreeControl` has no `getValue`, so a tree built on one persists nothing.
 *
 * Warn-only. The markup whose behaviour changed is exactly the markup that says nothing about the
 * input, so there is no expression to rewrite — and rewriting it to `[useStateSaving]="false"` would
 * withhold the feature this release is shipping.
 */

/** Import specifiers that mark a file as a tree consumer. */
export const TREE_PACKAGE = '@koobiq/components/tree';

/** Identifier and element shapes that mark a consumer without an import. */
export const TREE_TYPE = '\\bKbqTreeSelection\\b|\\bKbqTree\\b|\\bkbq-tree-selection\\b|\\bkbq-tree\\b';

export interface WarnPattern {
    /** Owner of the change. The pattern is only evaluated for files that also name it. */
    anchor: string;
    /** The markup or call sites the change reaches. */
    pattern: string;
    /** When present, the file is skipped if this matches — for reporting an absence. */
    unless?: string;
    message: string;
}

/** The rendered element, which is what the default flip reaches. `<kbq-tree` also opens the selection. */
const TREE_ELEMENT = '<kbq-tree-selection\\b|<kbq-tree[\\s>]';

export const warnPatterns: WarnPattern[] = [
    {
        anchor: TREE_ELEMENT,
        pattern: TREE_ELEMENT,
        unless: '\\buseStateSaving\\b',
        message:
            'Trees persist their expanded nodes by default now: useStateSaving defaults to true. Pass ' +
            '[useStateSaving]="false" to keep the previous behaviour. To keep persistence but pin where ' +
            'the state is stored, give the tree a stateSavingKey — or an id, which anchors the key ' +
            'derived from the document just as well. Selection is not persisted; it stays with the form ' +
            'control the tree is bound to.'
    },
    {
        anchor: 'new\\s+FlatTreeControl\\b',
        pattern: 'new\\s+FlatTreeControl\\b',
        unless: '\\[useStateSaving\\]="false"',
        message:
            'Expansion is persisted by the value getValue returns — the third argument of the ' +
            'FlatTreeControl constructor. Check that it returns a string that is stable across reloads ' +
            'and unique within the tree: a value derived from the node index, or from the node object, ' +
            'restores the wrong branches. Where two nodes share a value, the first of them is expanded.'
    },
    {
        anchor: TREE_TYPE,
        pattern: '\\.\\s*(expandAll|collapseAll|expandDescendants|collapseDescendants)\\s*\\(|\\.\\s*expansionModel\\b',
        message:
            'Expansion the application performs itself is not persisted on its own — only what a user ' +
            'expands or collapses is. Call saveState() on the tree after expanding programmatically if ' +
            'that state should be restored on the next visit.'
    },
    {
        anchor: 'new\\s+NestedTreeControl\\b',
        pattern: 'new\\s+NestedTreeControl\\b',
        message:
            'A tree on a NestedTreeControl persists nothing: the control has no getValue, so there is no ' +
            'stable identity to store a node under. A warning is logged in dev mode; unset ' +
            'useStateSaving on that tree to silence it.'
    }
];

/** Printed once, after the per-file reports. */
export const SUMMARY = [
    '  Nodes that arrive after the tree has initialized are waited for, so a lazily loaded tree is',
    '  restored as its branches load. Nothing is persisted while a search filter is active, and a tree',
    '  rendered inside an overlay — the one kbq-tree-select puts in its panel, for instance — does not',
    '  persist at all, because it has no stable key while it is out of the document.',
    '  Storage format: entries are written under a "kbq.state." prefix and carry a timestamp, so an',
    '  entry stranded by a markup change is collected once it outlives KBQ_STATE_SAVING_TTL (90 days by',
    '  default).',
    '  Provide KBQ_STATE_STORE to persist somewhere else (KbqSessionStorageStateStore is bundled), and',
    '  KBQ_STATE_SAVING_KEY_RESOLVER to derive the key from something other than the document position.'
];
