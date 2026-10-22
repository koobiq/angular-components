# Proposal

## Why

The baseline spec of `skeleton` states behaviour the code does not have. A static audit of `openspec/specs/skeleton/spec.md` against `packages/components/skeleton` on `c9c196a9b` found one requirement that promises more than the source delivers; this change corrects it so the spec describes what ships.

## What Changes

- **Styles load on their own**: only a `KbqSkeleton` instance loads the skeleton styles, so a layout preset loads them only when it draws at least one placeholder; a preset whose counts leave it nothing to draw, such as `kbq-skeleton-tabs` with `count` 0 and projected content without a skeleton, loads none.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `skeleton`: corrects the requirement "Styles load on their own".

## Impact

Only OpenSpec files: the delta under `openspec/changes/correct-skeleton-baseline/` and, once archived, `openspec/specs/skeleton/spec.md`. No source, test, documentation or public API changes.
