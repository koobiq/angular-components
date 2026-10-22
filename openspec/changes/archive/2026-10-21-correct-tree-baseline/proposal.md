# Proposal

## Why

The baseline spec of `tree` states behaviour the code does not have. A static audit of `openspec/specs/tree/spec.md` against `packages/components/tree` and the `core` pieces it relies on, on `c9c196a9b`, found seventeen requirements whose wording contradicts the source or holds only in some modes; this change corrects them so the spec describes what ships.

## What Changes

- **Node template context**: `index` and `level` are set when a row is created and are not updated afterwards, so rows inserted above a row leave its `index` stale.
- **Flattening nested data**: children are read from an `Observable` only when it emits synchronously; children it emits later are appended to the end of the returned list, out of depth-first order.
- **Expansion through the tree control**: only a tree fed by a source that re-emits on expansion, such as `KbqTreeFlatDataSource`, follows an expansion made in code.
- **Indentation of nodes**: the 24 extra for a row without a toggle is decided by a `kbq-tree-option` from the toggle it projects; a `kbq-tree-node` row, and an option carrying `kbqTreeNodeToggle` on itself, always get it.
- **Toggle state**: a disabled toggle does not stop the click it ignores, so the click reaches the row and selects it.
- **Text filter**: what it states holds for a non-empty query; an empty query publishes the kept nodes, not the query.
- **Expansion while filtering**: an empty query ends the filter only when the filter stages keep no node for it.
- **Default view value matching**: an empty query reaches the test as `null`, so only view values containing the text "null" match.
- **Ctrl or Cmd click**: in single selection a Ctrl/Cmd click on another node replaces the selected one.
- **Shift range**: the range is anchored on the option the key manager recorded as previously active, which after an arrow key is the option the key left, not the one active at the Shift click.
- **Non-selectable options**: a Shift arrow key that lands on a non-selectable option still emits `selectionChange` with it.
- **Tri-state checkbox**: a branch whose toggle is disabled, as every toggle is while a filter is active, shows its own selection instead of the rolled-up state.
- **Disabled tree**: the toggles of a disabled tree still expand and collapse their rows.
- **Expansion is restored**: an array payload restores its string entries; only a payload that is not an array, or an array without a single string, restores nothing.
- **Focus entering the tree**: with nothing selected focus goes to the first enabled option, and a found option that is disabled takes no focus, which stays on the tree element.
- **Vertical keyboard navigation**: a page that lands on a disabled option goes on by whole pages and does not move at all once that runs past the end.
- **Row semantics**: `aria-checked` replaces `aria-selected` where the option's `showCheckbox` resolves to true, whatever checkbox the row projects.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `tree`: corrects the requirements "Node template context", "Flattening nested data", "Expansion through the tree control", "Indentation of nodes", "Toggle state", "Text filter", "Expansion while filtering", "Default view value matching", "Ctrl or Cmd click", "Shift range", "Non-selectable options", "Tri-state checkbox", "Disabled tree", "Expansion is restored", "Focus entering the tree", "Vertical keyboard navigation" and "Row semantics".

## Impact

Only OpenSpec files: the delta under `openspec/changes/correct-tree-baseline/` and, once archived, `openspec/specs/tree/spec.md`. No source, test, documentation or public API changes.
