# Proposal

## Why

The baseline spec of `content-panel` states behaviour the code does not have. A static audit of `openspec/specs/content-panel/spec.md` against `packages/components/content-panel` and the shared state saving and overflow shadow code in `packages/components/core` on `c9c196a9b` found five requirements whose wording contradicts the source; this change corrects them so the spec describes what ships.

## What Changes

- **Main content makes room for the panel**: the space the main content leaves is the width the container holds (the `width` input, or a width dragged or restored since) plus 16 px, and that width is not held between `minWidth` and `maxWidth`. Outside those bounds the panel is clamped by its inline styles but the space is not, so it no longer matches the panel. A scenario shows a `width` above `maxWidth`.
- **State saving is on by default**: `KbqStateSavingService.setEnabled(false)` stops the container reading and writing even while `useStateSaving` is `true`, and a container that did not read its state on initialization, because either switch was off, never starts persisting when the switch is turned on later. Two scenarios are added.
- **Key changes**: a change of `stateSavingKey` made while state saving is off or the container is detached is not read, and the container then writes nothing, even once state saving is back on, until the key changes again. A scenario is added.
- **Registration with the state saving service**: the service lists the key the container read its state from, empty until it has read, and its own `useStateSaving` as `enabled`, which stays `true` for a container that persists nothing. A scenario with a detached container is added.
- **Overflow shadows**: the shadows are measured after the first render and then only when the body scrolls or its visible area changes size, so content added to a full body scrolled to its end leaves the footer without its shadow. A scenario is added.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `content-panel`: corrects the requirements "Main content makes room for the panel", "State saving is on by default", "Key changes", "Registration with the state saving service" and "Overflow shadows".

## Impact

Only OpenSpec files: the delta under `openspec/changes/correct-content-panel-baseline/` and, once archived, `openspec/specs/content-panel/spec.md`. No source, test, documentation or public API changes.
