# tree-state-saving-default

Migration schematic invoked automatically by `ng update @koobiq/components@20`
(registered for `21.0.0-0`). Reports the consequences of the tree persisting its expanded nodes, with
`useStateSaving` defaulting to `true`. It never writes to the tree.

## Background

`KbqTreeSelection` and `KbqTree` gained the same state saving the accordion has, applied through the
`KbqStateSaving` host directive, and it is on by default. A tree with no `stateSavingKey` derives its key
from where it sits in the document — the chain of tag names up to `<body>`, cut short by the first
author-written `id`, which becomes the anchor. So a tree inside `<section id="catalog">` persists under
`#catalog/kbq-tree-selection`, and everything above that `id` can be restructured without moving the key.

Only expansion is persisted. Selection belongs to the form control the tree is bound to, and restoring it
from storage would overwrite the value the application supplied.

## What it reports

- **The default flip.** A file that renders `kbq-tree-selection` or `kbq-tree` and never writes
  `useStateSaving`.
- **How a node is identified.** Expansion is persisted by the value `getValue` returns — the third
  argument of the `FlatTreeControl` constructor. It must be a string, stable across reloads, and unique
  within the tree; a node object is re-created whenever the data is replaced, so it cannot serve as the
  key. Where two nodes share a value, the first of them is expanded.
- **Programmatic expansion.** `expandAll()`, `collapseAll()`, `expandDescendants()`,
  `collapseDescendants()` and direct writes to `expansionModel` are not persisted on their own — only
  what a user expands or collapses is. Call `saveState()` afterwards to record them.
- **`NestedTreeControl`.** It has no `getValue`, so a tree built on one persists nothing and logs a
  dev-mode warning.

Each check is evaluated against the whole file, matching the other warn-only migrations in this
collection. A file holding two trees where only one opts out is not reported — inspect it by hand.

## What it does _not_ do

It does not insert `[useStateSaving]="false"`. The markup whose behaviour changed is exactly the markup
that says nothing about the input, so opting every tree out would be a rewrite of every consumer template
that also withholds the feature this release is shipping. Opting out stays a decision the application
makes.

## Behaviour worth knowing without a report

- **Nodes that arrive late are waited for.** A value whose node is not loaded yet is applied as soon as
  it appears, so a lazily loaded tree is restored as its branches load. Until then the value is kept, so
  persisting a change made in the meantime does not drop the branches still loading.
- **Nothing is persisted while a filter is active.** `filterNodes()` rewrites the expansion set to every
  expandable node that matched and puts the real one back afterwards, so what is expanded during a search
  is a view of the results rather than a state.
- **A tree inside an overlay does not persist.** `kbq-tree-select` renders one into its panel, where the
  tree is not in the document when it initializes and so has no stable key.
- **Trees sharing one `treeControl` share one expansion model** while persisting under a key each: the
  last one to initialize decides what is restored.

## Storage format

Entries are written under a `kbq.state.` prefix and carry a `savedAt` timestamp, so an entry stranded by a
markup change is collected once it outlives `KBQ_STATE_SAVING_TTL` (90 days by default). Reading an entry
refreshes it, so state that is visited but never changed does not expire under an active user.

## Related tokens

- `KBQ_STATE_STORE` — where state is persisted. `KbqSessionStorageStateStore` is bundled for state that
  should live no longer than the tab session.
- `KBQ_STATE_SAVING_KEY_RESOLVER` — how the key is derived when no `stateSavingKey` is given.
- `KBQ_STATE_SAVING_TTL` — how long an entry survives without being written or read.
