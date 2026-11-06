# Proposal

## Why

The baseline spec of `link` states behaviour the code does not have. A static audit of `openspec/specs/link/spec.md` against `packages/components/link` on `c9c196a9b` found one requirement whose wording contradicts the source and the unit tests; this change corrects it so the spec describes what ships.

## What Changes

- **Whitespace at the edges of the text**: the link trims only a text node that stands at an edge of the text (the anchors of control-flow blocks aside); whitespace inside an element at an edge, such as `<b> 3 </b>`, is kept. The "Spaces inside the text" scenario named a text with a single space while claiming three spaces are kept; it now states the three spaces the unit test uses.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `link`: corrects the requirement "Whitespace at the edges of the text".

## Impact

Only OpenSpec files: the delta under `openspec/changes/correct-link-baseline/` and, once archived, `openspec/specs/link/spec.md`. No source, test, documentation or public API changes.
