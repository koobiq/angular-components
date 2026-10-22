# Proposal

## Why

The baseline spec of `dropdown` states behaviour the code does not have. A static audit of `openspec/specs/dropdown/spec.md` against `packages/components/dropdown` on `c9c196a9b` found thirteen requirements whose wording the source contradicts in at least one mode; this change corrects them so the spec describes what ships.

## What Changes

- **Close reasons**: the reason of an item activation follows the panel's focus origin, which Page Up and Page Down set to `keyboard` too, and which an opening with `kbqDropdownTriggerAutoFocus` off leaves as it was, so such an opening with the keyboard does not make it `'keydown'`.
- **Scrolling the page**: only scrolls the CDK `ScrollDispatcher` reports reposition the panel, those of the document and of registered containers; scrolling an ancestor that is not registered does not.
- **Focus restored on closing**: the origin is that of the last press on the trigger, so a click on the trigger that closes a panel opened with the keyboard or by a call restores focus with the `mouse` origin.
- **Focus across nested panels**: when an item activation closes the chain, the trigger item of every nested panel opened by a call takes focus on the way to the root trigger.
- **Navigation wrap**: `navigationWithWrap` is read when the key manager of a navigation mode is built, so again the first time the panel switches between focus and highlight navigation.
- **Inactive secondary action**: an action that had no `tabindex` keeps `tabindex="-1"` once its item is active again.
- **Nested panel position**: the top of a nested panel is 4 px above the item's top only when it opens downward; when it falls back upward, its bottom is 4 px below the item's bottom.
- **Search field**: a `kbq-form-field` without `kbqDropdownSearch` is put in overlay mode only when it is the first one in the content when the content initializes; and lazily rendered items that come up while the field holds a query get the first one highlighted right after opening.
- **Width of a panel with a form field**: nested panels and panels that set `overlapTriggerY` without `overlapTriggerX` are not pinned.
- **Invalid positions**: the value a panel starts with, from `KBQ_DROPDOWN_DEFAULT_OPTIONS`, is not checked.
- **Overlapping the trigger**: a panel with `xPosition: 'center'` ignores `overlapTriggerX`.
- **Explicit panel width**: `panelWidth` sizes only top-level panels that do not set `overlapTriggerY` without `overlapTriggerX`.
- **Panels not matched to the trigger**: an explicit `panelWidth` turns off their `panelMinWidth` floor.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `dropdown`: corrects the requirements "Close reasons", "Scrolling the page", "Focus restored on closing", "Focus across nested panels", "Navigation wrap", "Inactive secondary action", "Nested panel position", "Search field", "Width of a panel with a form field", "Invalid positions", "Overlapping the trigger", "Explicit panel width" and "Panels not matched to the trigger".

## Impact

Only OpenSpec files: the delta under `openspec/changes/correct-dropdown-baseline/` and, once archived, `openspec/specs/dropdown/spec.md`. No source, test, documentation or public API changes.
