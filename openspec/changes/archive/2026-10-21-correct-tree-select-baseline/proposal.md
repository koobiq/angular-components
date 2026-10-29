# Proposal

## Why

The baseline spec of `tree-select`, written from the code on `c9c196a9b` and never checked, states behaviour the code does not have. A static audit against the component, its tests and the `tree` and `core` pieces it drives found eight requirements with statements the code contradicts, so the spec cannot yet serve as the contract to diff against.

## What Changes

- **Focus moves into the open panel**: a disabled active option refuses focus, so DOM focus does not move onto it.
- **Active option on open**: the first selected node is skipped only when the tree control's `isDisabled` reports it; a node disabled through its option's `disabled` input or a disabled tree still becomes active.
- **Selection mode and value type**: changing the multiplicity of the projected tree's `multiple` input throws the tree's own error, not the tree-select's `multiple` mode error.
- **Disabled and non-selectable options**: Enter and Space in a multiple tree-select toggle the active option without checking `disabled`, so they toggle a disabled option that opening the panel made active.
- **Values are matched by the tree control**: each written value selects only the first data node that matches it, not every matching node.
- **Select-all scope and state**: a node without a rendered option is left out only through the tree control's `isDisabled`; its option's `disabled` and `selectable` inputs and a disabled tree do not exclude it.
- **Select-all action**: `selectionChange` fires only when a node with a rendered option changed, not whenever something changed.
- **Keys in the search field**: in single-selection mode with `autoSelect` on, Enter closes the panel and moves focus to the tree-select instead of returning it to the field, and a selection refocuses the field only when it toggles an option and the panel stays open.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `tree-select`: corrects the eight requirements above so that they describe what the component does.

## Impact

Only OpenSpec files: the delta in `openspec/changes/correct-tree-select-baseline/specs/tree-select/spec.md`, and `openspec/specs/tree-select/spec.md` once the change is archived. No source, test, docs or API change.
