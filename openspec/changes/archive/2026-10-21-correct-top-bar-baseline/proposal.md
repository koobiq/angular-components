# Proposal

## Why

The baseline spec of `top-bar` states behaviour the code does not have. A static audit of `openspec/specs/top-bar/spec.md` against `packages/components/top-bar` on `main` found two requirements whose statements the stylesheets contradict once sticky positioning and the CSS cascade are followed through, so a consumer relying on them would expect the wrong thing.

## What Changes

- **Sticky positioning needs an inset**: the inset makes the bar stick only within its parent element, which bounds a sticky box. A bar wrapped in an element of its own, such as the `<header>` its JSDoc suggests for a page header, scrolls away with that element instead of sticking to its scrolling ancestor.
- **Custom properties are read from the bar element**: the defaults are declared outside any cascade layer, so not "any selector" overrides them. An inline style or a rule outside any cascade layer with a non-zero specificity does; a rule inside a cascade layer does not, and a zero-specificity rule outside any layer does only when it comes later.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `top-bar`: corrects the two requirements listed above so that they state what the code does.

## Impact

Only OpenSpec files: `openspec/changes/correct-top-bar-baseline/` now, and `openspec/specs/top-bar/spec.md` once the change is archived. No source, test, documentation or API change.
