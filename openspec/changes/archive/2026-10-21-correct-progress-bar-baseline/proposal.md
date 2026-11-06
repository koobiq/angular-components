# Proposal

## Why

The baseline spec of `progress-bar` states behaviour the code does not have. A static audit of `openspec/specs/progress-bar/spec.md` against `packages/components/progress-bar` on `c9c196a9b` found one requirement whose guarantee holds only in a left-to-right layout; this change corrects it so the spec describes what ships.

## What Changes

- **Indeterminate fill sweeps across the track**: the sweep is guaranteed only in a left-to-right layout. The keyframes move the segment with a physical `translateX()` from a left transform origin and are not mirrored, so in a right-to-left layout, where the segment is laid out at the right end of the track, an iteration starts with the segment in the middle of the track and ends with it outside the track for a large part of the iteration.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `progress-bar`: corrects the requirement "Indeterminate fill sweeps across the track".

## Impact

Only OpenSpec files: the delta under `openspec/changes/correct-progress-bar-baseline/` and, once archived, `openspec/specs/progress-bar/spec.md`. No source, test, documentation or public API changes.
