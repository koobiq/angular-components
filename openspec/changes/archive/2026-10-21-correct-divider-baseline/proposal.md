# Proposal

## Why

The baseline spec of `divider` states behaviour the code does not have. A static audit of `openspec/specs/divider/spec.md` against `packages/components/divider` on `c9c196a9b` found one requirement whose wording holds only in some layouts; this change corrects it so the spec describes what ships.

## What Changes

- **Default length follows the layout**: without `length`, a horizontal divider spans the width only of a block container (in a flex row it is sized to its empty content, 0 px), and a vertical divider fills its container only when that container has a definite height: its `height: 100%` does not resolve in a container whose height depends on its content, and the line collapses to 0 px.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `divider`: corrects the requirement "Default length follows the layout".

## Impact

Only OpenSpec files: the delta under `openspec/changes/correct-divider-baseline/` and, once archived, `openspec/specs/divider/spec.md`. No source, test, documentation or public API changes.
