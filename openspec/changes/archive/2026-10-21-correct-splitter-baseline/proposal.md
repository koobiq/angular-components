# Proposal

## Why

The baseline spec of `splitter` states behaviour the code does not have. A static audit of `openspec/specs/splitter/spec.md` against `packages/components/splitter` at `c9c196a9b` found six requirements that contradict the source in some case.

## What Changes

- **Layout before the first measurement**: before the splitter has a size, Enter, Home and End on the separator of a collapsible panel still flip its `collapsed` state, which applies once the splitter is measured. The requirement now says that only drags and arrow keys do nothing in that state.
- **Layout two-way binding**: Home on a collapsible panel already at its minimum collapses it through `collapsed` and leaves `layout` as it was. The requirement no longer lists that press among the resizes that write `layout`.
- **Collapsed size**: the space a collapse frees goes to the open panels in equal parts only when the host has set `layout` and the collapse comes from the host, Enter or Home. With a derived layout the open panels that declare a `size` keep it, and a drag leaves the open panels where it put them. The requirement now states the three cases, with scenarios for the first two.
- **Expanding restores the previous size**: a panel collapsed by Enter, Home or the host while `layout` is `null` records no size to return to. Once any later resize writes the layout, its entry holds its strip, and expanding fits that strip to its limits. The requirement and the "Another boundary moved meanwhile" scenario are now limited to a panel collapsed by a drag or while `layout` was set, and a new scenario covers the derived case.
- **Separator beside a panel collapsed to nothing**: only the separator next to the first or the last panel ends up on the splitter's edge. Next to a middle panel the separators stay on an inner boundary. The requirement is now limited to the first and the last panel.
- **Separator value**: the range counts the room of every panel after the separator, since the panel grows and shrinks against all of them. Only the panels before it do not count. The requirement now says which side counts, with a new scenario.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `splitter`: corrects the requirements "Layout before the first measurement", "Layout two-way binding", "Collapsed size", "Expanding restores the previous size", "Separator beside a panel collapsed to nothing" and "Separator value" to match the code.

## Impact

Only OpenSpec files: `openspec/changes/correct-splitter-baseline/` now, and `openspec/specs/splitter/spec.md` once the change is archived. No source, test, example or documentation file changes.
