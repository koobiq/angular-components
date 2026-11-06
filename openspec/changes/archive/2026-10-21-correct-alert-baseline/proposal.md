# Proposal

## Why

The baseline spec of `alert` states behaviour the code does not have. A static audit of `openspec/specs/alert/spec.md` against `packages/components/alert` on `c9c196a9b` found seven requirements whose wording contradicts the source; this change corrects them so the spec describes what ships.

Two causes lie behind them. The alert finds its parts with content queries that look through an `<ng-container>` and through every root node of a control flow block, while Angular projects a part into a named slot only from a top-level node, taking a control flow block into account only when its content is a single element. A part the queries find but the slot does not get is rendered in the text area, yet it still opens its slot's wrapper and sets the classes that depend on it. And the icon re-tint compares the icon's color with the last color the alert assigned, not with who set it.

## What Changes

- **Status icon slot**: the icon wrapper follows the icon the alert finds, not the icon in the slot. An icon at the root of a top-level `<ng-container>` or of a control flow block with several root nodes is rendered in the text and leaves an empty `kbq-alert__icon`.
- **Explicit icon color wins**: an icon projected with an explicit color equal to the color the alert last assigned, for example one that replaced an auto-tinted icon, is re-tinted on the next `alertColor` change.
- **Re-tint on status change**: only the icon the alert currently tints is re-tinted, and only while its color is still the one the alert last assigned. An icon item tinted before a `kbq-icon` joined it keeps the old status color.
- **Close control slot**: the close wrapper follows the close control the alert finds. A close control in the positions above is rendered in the text, leaves the wrapper empty, and a click on it does not emit `closed`.
- **Dismissible host class**: the class follows the close control the alert finds, including one rendered in the text.
- **Title layout modifiers**: the modifiers follow the title the alert finds, including one rendered in the text.
- **Action controls**: the button stack follows the controls the alert finds. A control in the positions above is rendered in the text and, on its own, leaves an empty stack.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `alert`: corrects the requirements "Status icon slot", "Explicit icon color wins", "Re-tint on status change", "Close control slot", "Dismissible host class", "Title layout modifiers" and "Action controls".

## Impact

Only OpenSpec files: the delta under `openspec/changes/correct-alert-baseline/` and, once archived, `openspec/specs/alert/spec.md`. No source, test, documentation or public API changes.
