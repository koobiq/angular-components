# Proposal

## Why

The baseline spec of `inline-edit` states behaviour the code does not have. A static audit of `openspec/specs/inline-edit/spec.md` against `packages/components/inline-edit` at `c9c196a9b` found ten requirements with a statement that the source, the CDK pieces it relies on or a test contradicts in some case.

## What Changes

- **Mode and its host classes**: `modeChange` is the output of a `model()`, which emits only when the signal is set, by the inline edit itself or by code calling `mode.set()`. A value the parent writes through the `mode` input, as `[(mode)]` does, is not emitted back, so not every transition reaches `modeChange`.
- **Edit panel placement**: with `editModeWidth` set, `setOverlayWidth()` returns before it starts the resize observer, so the panel is neither re-measured nor repositioned when the field's layout changes. The overlay layer is the one `KBQ_OVERLAY_LAYERS` picks, which skips the innermost `kbqOverlayLayer` behind a `kbqOverlayLayerExclude` element, among other rules.
- **Click outside the panel**: the CDK outside-click dispatcher stops at the topmost overlay that contains the click and listens for its own outside clicks, so a click in a select's options panel, a datepicker's calendar or a dropdown opened above the edit panel requests no save.
- **Validation tooltip waits for the field to be in view**: after the 800 ms fallback the scroll handle stays installed until a scroll end or the panel closing, so a later rejected save neither scrolls nor shows the tooltip, even for a field that is now fully visible.
- **Restoring the value of the form fields**: without `setValueHandler`, the value is written back only when it is an array. A non-array value, such as one returned by `getValueHandler`, is not written anywhere.
- **Failed state persists**: a new request, from a save or from `retrySave()`, sets `saveStatus` to `pending` at once, so the failed state ends when that request starts, not when a save succeeds, and comes back if it fails.
- **Rolling back a failed save**: `rollback()` restores the value recorded last, either by a successful request or by opening the editor outside the failed state. That opening value need not be one the server accepted, for example a value left in the control by closing the editor with `toggleMode()`.
- **Focus return after editing**: the panel's `cdkTrapFocusAutoCapture` focuses, when the panel is destroyed, the element that was focused when it opened, so focus that a click had moved to another element is taken back.
- **Focus classes of the host**: the focus ring is drawn for `kbq-inline-edit_anchor-focused`, which the focus anchor sets on any focus, so the anchor gets the ring whatever the focus origin, not only for keyboard focus.
- **Edit panel adds no tab stops**: with `showActions`, the panel adds its save and cancel buttons as tab stops, which the Playwright spec tabs through.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `inline-edit`: corrects the requirements "Mode and its host classes", "Edit panel placement", "Click outside the panel", "Validation tooltip waits for the field to be in view", "Restoring the value of the form fields", "Failed state persists", "Rolling back a failed save", "Focus return after editing", "Focus classes of the host" and "Edit panel adds no tab stops" to match the code.

## Impact

Only OpenSpec files: `openspec/changes/correct-inline-edit-baseline/` now, and `openspec/specs/inline-edit/spec.md` once the change is archived. No source, test, example or documentation file changes.
