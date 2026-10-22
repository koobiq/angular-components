# Proposal

## Why

The baseline spec of `toggle` states behaviour the code does not have. A static audit of `openspec/specs/toggle/spec.md` against `packages/components/toggle` and the shared checkable behaviour in `packages/components/core` on `c9c196a9b` found seven requirements whose wording contradicts the source; this change corrects them so the spec describes what ships.

## What Changes

- **Pointer click switches the toggle**: a click flips `checked` only while the toggle is neither disabled nor loading and the click action is not `noop`.
- **Indeterminate state**: with the `check` click action, a click on an indeterminate toggle leaves it indeterminate, but its native checkbox is no longer indeterminate and the switch shows its knob next to the dash.
- **Indeterminate change event**: the clearing that follows a click emits `false` without comparing it with the current value, so `indeterminateChange` emits `false` a second time when a `change` handler has already cleared `indeterminate`.
- **Big size**: the height of one text line holds only for a toggle without a hint whose label, if any, fits on one line.
- **ARIA naming inputs**: only `aria-label` is dropped when empty; an empty `aria-labelledby` reaches the native checkbox as an empty attribute.
- **Tab order**: a static `tabIndex` attribute also stays on the host element, which then becomes a second tab stop.
- **Motion**: the switch animates the move of its knob and dash and the background of its bar, not all of its colors, and the reduced-motion preference is read once, when the toggle is created, so turning it on later does not add `kbq-animations-disabled`.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `toggle`: corrects the requirements "Pointer click switches the toggle", "Indeterminate state", "Indeterminate change event", "Big size", "ARIA naming inputs", "Tab order" and "Motion".

## Impact

Only OpenSpec files: the delta under `openspec/changes/correct-toggle-baseline/` and, once archived, `openspec/specs/toggle/spec.md`. No source, test, documentation or public API changes.
