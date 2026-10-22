# Proposal

## Why

The baseline spec of `progress-spinner` states behaviour the code does not have. A static audit of `openspec/specs/progress-spinner/spec.md` against `packages/components/progress-spinner` on `c9c196a9b` found four requirements that promise more than the source delivers or leave out the condition they hold under; this change corrects them so the spec describes what ships.

## What Changes

- **Determinate arc follows the value**: only the circle's `stroke-dashoffset` takes a new `value` at once. While motion is on, the arc moves to it over the 0.3 s `stroke-dashoffset` transition, so the new value is not shown at once in every mode.
- **Non-numeric values read as zero**: an object that reaches the spinner at run time goes through the same `numberAttribute` check as a string, so `{}` reads as 0 but `[40]` or `new Number(40)` reads as 40.
- **Indeterminate arc ignores the value**: the fixed-length arc turns only while motion is on; with motion off it stands still, as "Turning motion off" already states.
- **Text and caption next to the circle**: a marked element is rendered only as a top-level node of the spinner's content or as the only root node of a control-flow block there. Nested in an unmarked element or `ng-container`, or as one of several root nodes of a control-flow block such as `@if`, it matches no slot, and the spinner has no catch-all slot, so it is not rendered.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `progress-spinner`: corrects the requirements "Determinate arc follows the value", "Non-numeric values read as zero", "Indeterminate arc ignores the value" and "Text and caption next to the circle".

## Impact

Only OpenSpec files: the delta under `openspec/changes/correct-progress-spinner-baseline/` and, once archived, `openspec/specs/progress-spinner/spec.md`. No source, test, documentation or public API changes.
