# Proposal

## Why

The baseline spec of `form-field` states behaviour the code does not have. A static audit of `openspec/specs/form-field/spec.md` against `packages/components/form-field` at `c9c196a9b` found three requirements whose descriptions contradict the source; their scenarios hold, and one of them gains a line for the corrected behaviour.

## What Changes

- **Clicking the container**: the container passes a click to the control's `onContainerClick`, but a click that activates the cleaner never gets there: `clear()` stops its propagation and focuses the control itself. The requirement no longer says "a click anywhere" and names that exception, which "Clearing with the cleaner" already describes.
- **Stepping with the mouse**: each step calls `stepUp()` or `stepDown()` of the number input, which focuses the input and keeps the result within its `min` and `max`, so pressing an arrow moves focus to the input instead of leaving it where it was. The default action of the mouse press is prevented only so that the arrow itself does not take focus. The requirement now says so, and its scenario checks the focus.
- **Stepper is mouse only**: an arrow gets `tabindex="-1"` only while the number input is enabled; a disabled icon button drops its `tabindex` altogether. The requirement now states both cases instead of `tabindex="-1"` alone.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `form-field`: corrects the requirements "Clicking the container", "Stepping with the mouse" and "Stepper is mouse only" to match the code.

## Impact

Only OpenSpec files: `openspec/changes/correct-form-field-baseline/` now, and `openspec/specs/form-field/spec.md` once the change is archived. No source, test, example or documentation file changes.
