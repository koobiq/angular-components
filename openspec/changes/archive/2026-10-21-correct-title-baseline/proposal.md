# Proposal

## Why

The baseline spec of `title` states behaviour the code does not have. A static audit of `openspec/specs/title/spec.md` against `packages/components/title`, the tooltip trigger it extends and the shared pop-up base in `packages/components/core` on `c9c196a9b` found five requirements whose wording the source or the tests contradict; this change corrects them so the spec describes what ships.

## What Changes

- **Any of several text elements can trigger the tooltip**: text elements that all fit the container still count as truncated when one of them is clipped by its siblings, so "all of them fit" needs that condition, as the unit and e2e tests of the sibling clip show.
- **Container resizes are followed**: the directive observes the container it resolves when its view initializes; a container that becomes the measured one later, such as a `#kbqTitleContainer` rendered by `@if`, is measured on hover but its own resizes are not followed.
- **Blur and non-keyboard focus close the tooltip**: only a click that moves focus onto the host closes the tooltip; a click on a host that already has focus fires no focus event and leaves an open tooltip open, and the mouse-origin scenario is reachable only by reporting that origin from code.
- **Tooltip ignores pointer events by default**: `ignoreTooltipPointerEvents` is read once, when the first opening creates the overlay, and the pane is reused, so a later change has no effect.
- **Default placement keeps the tooltip centred**: the default priority is decided once, when the view initializes; it keeps precedence over a `kbqPlacement` changed later, and clearing an explicit priority later does not bring it back.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `title`: corrects the requirements "Any of several text elements can trigger the tooltip", "Container resizes are followed", "Blur and non-keyboard focus close the tooltip", "Tooltip ignores pointer events by default" and "Default placement keeps the tooltip centred".

## Impact

Only OpenSpec files: the delta under `openspec/changes/correct-title-baseline/` and, once archived, `openspec/specs/title/spec.md`. No source, test, documentation or public API changes.
