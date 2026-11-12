# Popup arrow documentation examples

## Intent

Make the centered-arrow behavior introduced in DS-2467 obvious in the existing documentation examples.

## Goals

- Extend `popover-placement-edges` with an `Arrow centered` toggle that applies to its arrow-enabled placements and defaults to `false`.
- Show ordinary and centered tooltip arrows with the same `bottomRight` placement so their positions can be compared directly.
- Keep both examples on their current pages without new example registration or generated module changes.

## Non-goals

- Do not add new example IDs, change runtime component code or alter the new inputs' defaults.
- Do not duplicate examples between the Overview and Examples tabs.

## Approaches

1. **Chosen: extend current examples.** This puts the popover control directly under the Alignment explanation and makes the tooltip comparison consistent, with minimal maintenance cost.
2. **Rejected: dedicated examples.** Side-by-side examples would be more prominent but require new registrations and generated files without explaining more behavior.

## Implementation and verification

Bind the popover toggle to every placement that currently renders an arrow, leaving placements without arrows unchanged. Give the tooltip's ordinary arrow the same `bottomRight` placement as its centered counterpart. Verify the examples with `build:docs-examples`, the documentation content build, formatting, spellchecking and a browser smoke check of both controls.
