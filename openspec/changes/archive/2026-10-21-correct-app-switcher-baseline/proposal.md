# Proposal

## Why

The baseline spec of `app-switcher` states behaviour the code does not have. A static audit of `openspec/specs/app-switcher/spec.md` against `packages/components/app-switcher` and the code it relies on in `core`, `dropdown` and the CDK on `c9c196a9b` found six requirements whose wording contradicts the source; this change corrects them so the spec describes what ships.

## What Changes

- **Placement**: `kbqPlacementChange` does not emit whenever the overlay applies a position. It emits for the first position of every opening, and afterwards only when the applied position, or whether the trigger or the popup is clipped by or out of its scroll containers, changes; re-applying an unchanged position, as the overlay does when the popup's own list scrolls, emits nothing.
- **Outer scroll closes the switcher**: only a scroll of the document or of a container registered with the CDK `ScrollDispatcher` (a `cdkScrollable` element, the viewport of a `kbq-scrollbar`) reaches the switcher; a plain scrollable container outside it does not close it.
- **Inline icon sanitization**: elements are matched by local name in any namespace, so an HTML element named like an allowed SVG element, such as `title`, is kept rather than removed; the URL check covers `href` and `xlink:href`.
- **Grouping by type**: the default grouping keys on the string form of `type`, so `1` and `'1'` form one type.
- **Row order**: group rows whose type has the string form of a non-negative integer come first in ascending numeric order, not in the order in which their type first appears; the other types keep that order.
- **Flyout follows the row that opened it**: the switch to another site or group row happens at once when the pointer is outside the safe triangle towards the open flyout; `NESTED_HOVER_SWITCH_DELAY` applies only inside it, and only a row crossed inside it keeps the flyout.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `app-switcher`: corrects the requirements "Placement", "Outer scroll closes the switcher", "Inline icon sanitization", "Grouping by type", "Row order" and "Flyout follows the row that opened it".

## Impact

Only OpenSpec files: the delta under `openspec/changes/correct-app-switcher-baseline/` and, once archived, `openspec/specs/app-switcher/spec.md`. No source, test, documentation or public API changes.
