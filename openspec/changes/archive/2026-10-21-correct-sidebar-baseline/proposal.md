# Proposal

## Why

The baseline spec of `sidebar` states behaviour the code does not have. A static audit of `openspec/specs/sidebar/spec.md` against `packages/components/sidebar` and the state saving pieces of `core` at `c9c196a9b` found four requirements that contradict the source in some case.

## What Changes

- **Content switch timing**: a state restored from a new `stateSavingKey` sets the content of that state at once, also when it closes the sidebar, while the width still transitions. Only a change through the `opened` input or property, `toggle()` or the shortcut keeps the opened content until the narrowing ends. The requirement now names both paths, with a scenario for the key change.
- **Opened width bounds**: only `min-width` and `max-width` always follow the inputs of `[kbq-sidebar-opened]`. The opened `width` starts as its `width` input and is replaced by the pixel width captured on close or by a restored width, so a declared `50%` becomes pixels after the first close. The requirement now says so, and its scenarios are limited to a sidebar never closed and with nothing restored, with a new scenario for a percentage width.
- **State saving on by default**: `KbqStateSavingService.setEnabled(false)` stops the sidebar reading and writing even while `useStateSaving` is on. The requirement now names that switch next to `useStateSaving`, with a scenario.
- **Clearing the saved state**: `clearSavedState()` does nothing while `useStateSaving` is `false`, so an entry stored under the key stays. The requirement now limits the removal to a sidebar with state saving on, with a scenario.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `sidebar`: corrects the requirements "Content switch timing", "Opened width bounds", "State saving on by default" and "Clearing the saved state" to match the code.

## Impact

Only OpenSpec files: `openspec/changes/correct-sidebar-baseline/` now, and `openspec/specs/sidebar/spec.md` once the change is archived. No source, test, example or documentation file changes.
