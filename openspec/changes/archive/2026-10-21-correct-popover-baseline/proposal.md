# Proposal

## Why

The baseline spec of `popover` states behaviour the code does not have. A static audit of `openspec/specs/popover/spec.md` against `packages/components/popover` and the pop-up base in `packages/components/core` on `c9c196a9b` found fourteen requirements whose wording contradicts the source; this change corrects them so the spec describes what ships.

## What Changes

- **Arrow alignment on small triggers**: the shift is decided by the `kbqPopoverArrow` input and the size of the anchor, which is the `kbqPopoverOrigin` when one is set; a panel stuck to a window edge draws no arrow but is still shifted.
- **Distance from the trigger**: a custom `kbqPopoverOffset` is written as a margin for the placement the panel has when it is shown; after the placement of an open panel changes, the side facing the trigger has the stylesheet's 8 px until the next show.
- **Placement fallback**: a `kbqPopoverPlacementPriority` without any known name is not ignored; it leaves the position strategy without positions, and opening fails with an error.
- **Following the page scroll**: only the page and `cdkScrollable` ancestors are followed; the scroll of any other scrollable ancestor is not seen.
- **Closing on scroll**: `kbqPopoverCloseOnScroll` closes the popover on a scroll of the page or of a `cdkScrollable` ancestor, not of any scrollable ancestor.
- **Overlay layers**: a trigger inside a `kbqOverlayLayerExclude` element (`kbq-top-bar` and the navigation bars), or inside another overlay container within the layer element, and a layer element outside the fullscreen element keep the panel in the application-wide overlay container.
- **Sticking to a window edge**: the pin is re-applied after a window resize and when a new position is reported, not after a scroll that re-applies the last position; the pinned-pane scenario is limited to a trigger at least 34 px wide, which the arrow-alignment shift leaves in place.
- **Confirming**: the confirm button closes the popover after the leave delay, and does not close a hover-triggered confirmation popover while the pointer rests on its panel.
- **Trigger events**: `manual` binds none of the opening listeners, but Escape, a touch on the host and the close button still close the popover.
- **Opening and closing in code**: `hide()` and `kbqPopoverVisible` set to `false` do nothing while the pointer, having left the host of a hover popover, rests on its panel.
- **Outside click closes a click popover**: a `focus` popover still closes on a click outside it, through the blur of its host.
- **Escape on the trigger**: Escape on the host does not close a hover popover whose panel holds the pointer, and is left to the enclosing container.
- **Disabled popover**: disabling does not close a hover popover whose panel holds the pointer until the pointer leaves the panel.
- **Focus returns to the trigger**: focus is not returned on every path; an overlay detached by a scroll strategy provided through `KBQ_POPOVER_SCROLL_STRATEGY` takes the panel away without returning it.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `popover`: corrects the requirements "Arrow alignment on small triggers", "Distance from the trigger", "Placement fallback", "Following the page scroll", "Closing on scroll", "Overlay layers", "Sticking to a window edge", "Confirming", "Trigger events", "Opening and closing in code", "Outside click closes a click popover", "Escape on the trigger", "Disabled popover" and "Focus returns to the trigger".

## Impact

Only OpenSpec files: the delta under `openspec/changes/correct-popover-baseline/` and, once archived, `openspec/specs/popover/spec.md`. No source, test, documentation or public API changes.
