# Proposal

## Why

The baseline spec of `tabs` states behaviour the code does not have. A static audit of `openspec/specs/tabs/spec.md` against `packages/components/tabs` on `c9c196a9b` found fifteen requirements whose wording contradicts the source or a test, mostly statements that hold only in some selection modes; this change corrects them so the spec describes what ships.

## What Changes

- **Only the selected tab's content is in the DOM**: the content of the tab being left stays attached until its switch animation has ended.
- **Pointer selection**: while `activeTab` holds a string, a click on a tab without a `tabId` selects the first enabled tab instead of the clicked one.
- **Selection change events**: the new index of a tab kept selected by index while tabs are added or removed is not emitted, and a group that renders without tabs emits once tabs arriving later select an index other than 0.
- **Value emitted by activeTabChange**: the output emits what `activeTab` holds (a number as set, not clamped; an unknown `tabId` as is; `null` while it holds nothing), not the selected index or the selected tab's `tabId`.
- **Active flag of a tab**: `isActive` is set only on a change of the selected index, so a tab selected without one (the first tab arriving in a group that rendered empty, or the tab that takes the index of a removed selected tab) keeps `isActive` `false`.
- **Selection survives a change of the tab list**: the selected tab is kept without an event only while the selection is held by index; in string mode its new index is emitted, and removing it selects the first tab, not the new last one.
- **Header position**: `below` puts the strip after the content only in a horizontal group; a vertical group keeps it before.
- **Stretched and aligned labels**: `kbq-stretch-tabs` adds its class to a nav bar, but no style stretches the links.
- **Switch animation**: the content slides in from the side on which the newly selected tab lies, not from the side of the previously selected tab.
- **Arrow keys move focus**: the keys move from the strip's focus position, which follows the selection, so with a disabled tab selected from code they move from that tab, not from the label focused with Tab.
- **Manual activation**: Enter and Space select the tab at that focus position, and in string mode a tab without a `tabId` selects the first enabled tab.
- **Focus moves next to a removed tab**: focus that left the strip for the document body still counts as in the strip, so a removal then moves focus back to a label.
- **Nav bar without a panel**: the nav bar drops an `aria-orientation` the author wrote, sets `vertical` for an author's `role="tablist"` on a vertical nav bar, and keeps the attributes of the panel mode after `tabNavPanel` is unbound.
- **Application-driven selection is not persisted**: a selection assigned in code on a persisting group is written once adding or removing tabs keeps it selected by index.
- **Group outside the document**: once attached, the group still writes nothing but logs the dev-mode warning about a tab without a `tabId`.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `tabs`: corrects the requirements "Only the selected tab's content is in the DOM", "Pointer selection", "Selection change events", "Value emitted by activeTabChange", "Active flag of a tab", "Selection survives a change of the tab list", "Header position", "Stretched and aligned labels", "Switch animation", "Arrow keys move focus", "Manual activation", "Focus moves next to a removed tab", "Nav bar without a panel", "Application-driven selection is not persisted" and "Group outside the document".

## Impact

Only OpenSpec files: the delta under `openspec/changes/correct-tabs-baseline/` and, once archived, `openspec/specs/tabs/spec.md`. No source, test, documentation or public API changes.
