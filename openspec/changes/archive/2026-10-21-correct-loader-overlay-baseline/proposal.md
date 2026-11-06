# Proposal

## Why

The baseline spec of `loader-overlay` states behaviour the code does not have. A static audit of `openspec/specs/loader-overlay/spec.md` against `packages/components/loader-overlay` on `c9c196a9b` found four requirements about projected content whose wording contradicts the template and the Angular content projection it relies on; this change corrects them so the spec describes what ships.

## What Changes

- **Projected indicator**: only a marked element at the top level of the content, with its directive imported, is rendered in place of the default spinner. A marked element nested in a wrapper still removes the default spinner but is not projected, so no indicator is shown at all.
- **Projected text**: the same rule for the text. A marked text nested in a wrapper makes the overlay ignore the bound `text` but is not shown itself, so no text is rendered.
- **Projected caption**: the same rule for the caption. A marked caption nested in a wrapper makes the overlay ignore the bound `caption` but is not shown itself, so no caption is rendered.
- **Only marked content is rendered**: a node whose `ngProjectAs` names a marker selector is rendered as well, with what is inside it, and the content matching a marker is rendered only while the content holds an element with the matching marker directive.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `loader-overlay`: corrects the requirements "Projected indicator", "Projected text", "Projected caption" and "Only marked content is rendered".

## Impact

Only OpenSpec files: the delta under `openspec/changes/correct-loader-overlay-baseline/` and, once archived, `openspec/specs/loader-overlay/spec.md`. No source, test, documentation or public API changes.
