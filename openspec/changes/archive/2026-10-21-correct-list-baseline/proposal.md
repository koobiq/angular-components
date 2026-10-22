# Proposal

## Why

The baseline spec of `list` states behaviour the code does not have. A static audit of `openspec/specs/list/spec.md` against `packages/components/list` and the `core` pieces it relies on, on `c9c196a9b`, found fifteen requirements whose wording contradicts the source or holds only in some modes; this change corrects them so the spec describes what ships.

## What Changes

- **Plain click toggles without autoSelect**: in single selection the toggle goes through a single-selection model, so selecting the clicked option deselects the one selected before; only a multiple mode leaves the other options alone.
- **Shift click selects a range**: the anchor is also set when focus leaves the list (and on the other moves the list makes itself), not only by a keyboard move, so a Shift-click can extend a range after mouse-only use; with `noUnselectLast` on the range keeps the last selected option.
- **Angular forms integration**: every value the list reports marks the control dirty, so `selectAll()`, `deselectAll()` and a narrowing of the mode do so too, not only the user's changes.
- **Selecting everything in code**: in single selection `selectAll()` leaves only the last rendered option selected.
- **Select-all row rendering**: the development-mode warning about `selectAll` inside a `cdk-virtual-scroll-viewport` is logged only when both are present at the first render.
- **Action button visibility**: a hovered option and the keyboard-focused option each show their action, so two can be visible at once; only a mouse-focused option gives its action up when the pointer leaves.
- **Single tab stop**: `Tab` takes the list out of the tab order until the next task, not until focus has left it.
- **Focus on entering the list**: when the first selected option is disabled, or no selected option is rendered, focus stays on the list.
- **Keyboard navigation**: `Down` and `Up` move the active option in a vertical list; a horizontal list moves it with `Right` and `Left`.
- **Page navigation**: a page that lands on a disabled option skips on by whole pages and does not move at all once that runs past the end.
- **Shift and an arrow select a range**: only an arrow key that moves the active option along the list's orientation moves it and applies the range.
- **Custom select-all handler**: the handler is called only in a multiple-selection list.
- **Drop indicator**: it appears over the option's own list and over lists connected by instance, never over a list connected only by `id`, and the gap is resolved along the list's orientation.
- **Drop forbidden feedback**: a list connected only by `id` gets the forbidden class and the `no-drop` cursor although it takes the drop.
- **Drag cursor**: with `dragCursor="grab"` an option holding a `cdkDragHandle` keeps the grab cursor on the handle only, and the drag cursor is `no-drop` where the drop forbidden feedback applies.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `list`: corrects the requirements "Plain click toggles without autoSelect", "Shift click selects a range", "Angular forms integration", "Selecting everything in code", "Select-all row rendering", "Action button visibility", "Single tab stop", "Focus on entering the list", "Keyboard navigation", "Page navigation", "Shift and an arrow select a range", "Custom select-all handler", "Drop indicator", "Drop forbidden feedback" and "Drag cursor".

## Impact

Only OpenSpec files: the delta under `openspec/changes/correct-list-baseline/` and, once archived, `openspec/specs/list/spec.md`. No source, test, documentation or public API changes.
