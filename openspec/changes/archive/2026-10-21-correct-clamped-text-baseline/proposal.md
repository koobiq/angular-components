# Proposal

## Why

The baseline spec of `clamped-text` states behaviour the code does not have. A static audit of `openspec/specs/clamped-text/spec.md` against `packages/components/clamped-text` on `c9c196a9b` found two requirements that state the rows + 1 line rule of `kbq-clamped-text` as if it were checked after every change, while the component only measures its content when the content box is resized; this change corrects them so the spec describes what ships.

## What Changes

- **One hidden line is shown instead of a toggle**: the rule is applied at each measurement, and only a resize of the content box is measured. A change of `rows` or of the projected content that leaves the box the same size keeps the toggle of the previous measurement, so content of `rows` + 1 lines or fewer is not always shown in full without a toggle (for example, expanded 20-line text whose `rows` grows from 5 to 30 keeps its toggle). The requirement now ties the rule to the latest measurement, from the first one on.
- **Collapsed state of the clamped text**: `undefined` does not collapse the text "whenever the content overflows". Text of 6 lines measured with `rows` at 5 stays expanded without a toggle after `rows` drops to 2, because nothing is measured. The default is now described as collapsed whenever the latest measurement found the content overflowing.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `clamped-text`: corrects the requirements "One hidden line is shown instead of a toggle" and "Collapsed state of the clamped text".

## Impact

Only OpenSpec files: the delta under `openspec/changes/correct-clamped-text-baseline/` and, once archived, `openspec/specs/clamped-text/spec.md`. No source, test, documentation or public API changes.
