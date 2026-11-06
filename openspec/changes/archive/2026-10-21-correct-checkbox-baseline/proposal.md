# Proposal

## Why

The baseline spec of `checkbox` states behaviour the code does not have. A static audit of `openspec/specs/checkbox/spec.md` against `packages/components/checkbox` and the `KbqCheckable` code it relies on, on `c9c196a9b`, found seven requirements whose wording contradicts the source; this change corrects them so the spec describes what ships.

## What Changes

- **Checked state is reflected**: the native input is written only when `checked` differs from the value last rendered, so a click whose toggle code undoes before the next render (for example in a `change` handler) leaves the native input in the state the click gave it.
- **Pointer toggles the checkbox**: a click toggles `checked` only when the click action is not `noop`.
- **Clickable area and cursor**: the hover style of the box is keyed to the whole host, so it also shows over the part of the host outside the label area; only the toggle and the `pointer` cursor are limited to the label area.
- **Indeterminate state is reflected**: after a click with the `check` click action the native input is no longer indeterminate while `indeterminate` stays `true`, until `indeterminate` changes again.
- **Indeterminate change notification**: the clearing after a default click emits `indeterminateChange(false)` without comparing, so it repeats the event when `indeterminate` was already set to `false`; the no-repeat rule holds only for the binding and the property.
- **Required flag on the native input**: without a form directive `required` adds no Angular validator, but the native input still takes part in the browser's constraint validation.
- **Required validation with a form directive**: the control is valid only while its value is exactly `true`, so a truthy non-boolean value written by the form checks the checkbox but leaves the control invalid.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `checkbox`: corrects the requirements "Checked state is reflected", "Pointer toggles the checkbox", "Clickable area and cursor", "Indeterminate state is reflected", "Indeterminate change notification", "Required flag on the native input" and "Required validation with a form directive".

## Impact

Only OpenSpec files: the delta under `openspec/changes/correct-checkbox-baseline/` and, once archived, `openspec/specs/checkbox/spec.md`. No source, test, documentation or public API changes.
