# Proposal

## Why

The baseline spec of `flag` states behaviour the code does not have. A static audit of `openspec/specs/flag/spec.md` against `packages/components/flag` on `c9c196a9b` found two requirements that state the precedence of the aspect ratio without a condition the cascade imposes; this change corrects them so the spec describes what ships.

## What Changes

- **Aspect ratio input**: the input is a normal-priority inline declaration, so it outranks a stylesheet rule that redefines `--kbq-flag-aspect-ratio` only when that rule is not `!important`; it does not outrank "any stylesheet rule".
- **Proportions from a stylesheet**: a plain class rule sets the proportions of the flags it matches only when they have no `aspectRatio`; a flag with the input keeps the ratio of the input.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `flag`: corrects the requirements "Aspect ratio input" and "Proportions from a stylesheet".

## Impact

Only OpenSpec files: the delta under `openspec/changes/correct-flag-baseline/` and, once archived, `openspec/specs/flag/spec.md`. No source, test, documentation or public API changes.
