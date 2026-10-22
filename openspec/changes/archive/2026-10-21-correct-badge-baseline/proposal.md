# Proposal

## Why

The baseline spec of `badge` states behaviour the code does not have. A static audit of `openspec/specs/badge/spec.md` against `packages/components/badge` on `c9c196a9b` found six requirements whose wording contradicts the source; this change corrects them so the spec describes what ships.

## What Changes

- **Color given as a plain string**: the host class binding splits a value at whitespace, so a string with a space in it becomes several host classes (`success foo` adds `kbq-badge_success` and `foo`), not one `kbq-badge_<value>` class.
- **Supported color and fill combinations**: the color rules live in the badge's own stylesheet, which loads with the component, not in the prebuilt theme; the prebuilt theme has no badge rules.
- **Leading icon is marked**: the class is assigned only when the badge computes its icon classes, on the first render and when the set of its icons changes; whitespace-only text nodes count as child nodes.
- **Trailing icon is marked**: the same limits as the leading icon.
- **Icons that are alone, in the middle or nested are not marked**: an icon keeps a class it was given earlier when text is added or removed later, or when a removal leaves it as the only child node.
- **Icon classes follow icons added or removed later**: only a change to the set of icons triggers a recomputation; when one child node or fewer is left, the remaining icon keeps its classes, and text or other elements added or removed later leave every class as it was.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `badge`: corrects the requirements "Color given as a plain string", "Supported color and fill combinations", "Leading icon is marked", "Trailing icon is marked", "Icons that are alone, in the middle or nested are not marked" and "Icon classes follow icons added or removed later".

## Impact

Only OpenSpec files: the delta under `openspec/changes/correct-badge-baseline/` and, once archived, `openspec/specs/badge/spec.md`. No source, test, documentation or public API changes.
