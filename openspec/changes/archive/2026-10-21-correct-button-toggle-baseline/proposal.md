# Proposal

## Why

The baseline spec of `button-toggle` states behaviour the code does not have. A static audit of `openspec/specs/button-toggle/spec.md` against `packages/components/button-toggle` on `c9c196a9b` found ten requirements whose wording contradicts the source; this change corrects them so the spec describes what ships.

## What Changes

- **Single selection by pointer**: the selection keeps the mode the group had when it initialized, so a group whose `multiple` is turned off afterwards adds each clicked toggle to the selection instead of replacing it, and keeps reporting the value of the toggle selected first.
- **Multiple selection by pointer**: for the same reason, a group that gets `multiple` only after initialization still deselects the toggle selected before.
- **Order of values in multiple mode**: an out-of-order assignment emits `valueChange` only when the reordered array also differs from the value the group reported last.
- **Matching values to toggles**: of several toggles sharing a value, only a value assigned while they exist selects the first; a value in place before they initialize ends up on the last, because each toggle selects itself as it initializes.
- **Group change event**: the event follows a user change of the selection, not of the value, so it also fires when the newly selected toggle has the value of the one it replaces; a call of `onToggleClick()` counts as a user interaction.
- **Value change notification**: switching `multiple` after initialization reshapes the reported value without emitting `valueChange`.
- **Touched and dirty state**: the control becomes dirty and touched on a user change of the selection, even when the written value is unchanged, and on a call of `onToggleClick()` from code.
- **Inputs bound to undefined**: `[checked]` and `[disabled]` bound to `undefined` are converted to `false` and applied, not ignored.
- **Icon type classes**: icons are counted at any depth but compared with the nodes at the top level of the slots, so an element that wraps an icon together with a label counts as icon-only.
- **Focus methods and focus ring**: the `cdk-keyboard-focused` class of the toggle paints the focus ring only inside a group; a standalone toggle shows the ring of its inner button.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `button-toggle`: corrects the requirements "Single selection by pointer", "Multiple selection by pointer", "Order of values in multiple mode", "Matching values to toggles", "Group change event", "Value change notification", "Touched and dirty state", "Inputs bound to undefined", "Icon type classes" and "Focus methods and focus ring".

## Impact

Only OpenSpec files: the delta under `openspec/changes/correct-button-toggle-baseline/` and, once archived, `openspec/specs/button-toggle/spec.md`. No source, test, documentation or public API changes.
