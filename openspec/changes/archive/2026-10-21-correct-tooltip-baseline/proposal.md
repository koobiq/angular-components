# Proposal

## Why

The baseline spec of `tooltip` states behaviour the code does not have. A static audit of `openspec/specs/tooltip/spec.md` against `packages/components/tooltip` and the shared pop-up base in `packages/components/core` on `c9c196a9b` found sixteen requirements whose wording the source or the unit tests contradict; this change corrects them so the spec describes what ships.

## What Changes

- **Keyboard focus opens and blur closes**: with `hideWithTimeout` and `hover` also in `kbqTrigger`, the hover watchdog armed on every open closes a keyboard-opened tooltip `kbqLeaveDelay` ms after the focus while the pointer is elsewhere, before the blur.
- **Tooltips driven from code**: a `manual` tooltip still closes on Escape and on a touch end on its trigger element, on scrolling and when its parent pop-up closes; it does not close only through the programmatic APIs.
- **Touch end closes the tooltip**: the end event of a touch goes to the element the touch started on, so it is a touch that started on the trigger that closes the tooltip, wherever it ends.
- **Arrow alignment on small anchors**: the "large trigger" scenario needs a trigger that is 100 px in both directions; a wide but short trigger still shifts the vertically aligned positions.
- **Fallback placements**: `topLeft`, `topRight`, `bottomLeft` and `bottomRight` first try the other corner of the same side, not the opposite side.
- **Placement priority**: `topCenter` and `bottomCenter` are accepted as `top` and `bottom`, and a value made only of unknown names leaves no position, so opening fails instead of the names being ignored.
- **Positioning relative to the caret**: a field whose text cannot be measured, such as a `password` input, anchors the tooltip to the field's box, not to the trigger element's box.
- **Offset**: the margin is written for `kbqPlacement` when the tooltip opens, so a fallback or a `kbqPlacementPriority` placement keeps the stylesheet gap until the content, context, header, arrow or offset changes.
- **Returning pointer keeps the tooltip**: the pending close is cancelled only with `hover` in `kbqTrigger`.
- **Tooltip pane receives the pointer**: `ignoreTooltipPointerEvents` and the click-through rule for pinned tooltips are read once, when the overlay is created, and later changes have no effect.
- **Moving onto the tooltip with hideWithTimeout**: the pointer leaving a hover-opened tooltip closes it in the next task, not `kbqLeaveDelay` ms later, and the watchdog also closes a tooltip opened while the pointer is elsewhere; the resting scenario needs a leave delay.
- **Pop-up on the same element mutes the tooltip**: only a show requested while the sibling's overlay is attached is ignored; a show already pending is dropped only when the sibling announces that it opened.
- **Bindings reset to their defaults**: the rule holds for the listed inputs only; a bound `kbqTooltipSingleInstance` reads `undefined` as `false`.
- **Visibility from code**: `kbqVisible` goes through `show()` and `hide()` and is subject to their conditions.
- **Show and hide methods**: `show()` does nothing right after a focus that did not come from the keyboard, and `hide()` does nothing while the pointer that left the trigger rests on the tooltip.
- **Showing for another element**: the element stays the anchor of later opens, and a call on a disabled or empty tooltip whose overlay exists still moves the anchor.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `tooltip`: corrects the requirements "Keyboard focus opens and blur closes", "Tooltips driven from code", "Touch end closes the tooltip", "Arrow alignment on small anchors", "Fallback placements", "Placement priority", "Positioning relative to the caret", "Offset", "Returning pointer keeps the tooltip", "Tooltip pane receives the pointer", "Moving onto the tooltip with hideWithTimeout", "Pop-up on the same element mutes the tooltip", "Bindings reset to their defaults", "Visibility from code", "Show and hide methods" and "Showing for another element".

## Impact

Only OpenSpec files: the delta under `openspec/changes/correct-tooltip-baseline/` and, once archived, `openspec/specs/tooltip/spec.md`. No source, test, documentation or public API changes.
