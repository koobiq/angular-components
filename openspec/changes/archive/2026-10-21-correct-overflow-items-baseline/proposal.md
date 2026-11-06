# Proposal

## Why

The baseline spec of `overflow-items` states behaviour the code does not have. A static audit of `openspec/specs/overflow-items/spec.md` against `packages/components/overflow-items` on `c9c196a9b` found three requirements whose wording holds only in some modes or at some moments; this change corrects them so the spec describes what ships.

## What Changes

- **Hiding overflowing items from the end**: the main-axis rule applies only while `wrap` is not `'wrap'`. In the wrap mode the container checks only the cross axis, so twenty 50 px items in a 500 px container stay visible although their total width exceeds the container; the rule now says so and applies during a recalculation.
- **Always-visible items**: the guarantee is scoped to a recalculation. A change of `alwaysVisible` alone does not trigger one, so an item hidden before it became always visible stays hidden until the next recalculation; the requirement no longer claims such an item is never hidden.
- **Vertical orientation**: heights are measured only while `wrap` is not `'wrap'`. In the vertical wrap mode the container compares the width of its content with its own width; the requirement now states both cases.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `overflow-items`: corrects the requirements "Hiding overflowing items from the end", "Always-visible items" and "Vertical orientation".

## Impact

Only OpenSpec files: the delta under `openspec/changes/correct-overflow-items-baseline/` and, once archived, `openspec/specs/overflow-items/spec.md`. No source, test, documentation or public API changes.
