# Proposal

## Why

The baseline spec of `dl` states behaviour the code does not have. A static audit of `openspec/specs/dl/spec.md` against `packages/components/dl` at `c9c196a9b` found ten requirements that contradict the source in some case.

## What Changes

- **Terms and descriptions**: a term and its description share a row only in the horizontal layout; in the vertical layout the description goes under the term. The requirement and the "Pairs render row by row" scenario are now limited to the horizontal layout.
- **Default column ratio**: a resizable list at rest never makes the term track narrower than the term minimum, so a minimum wider than one track widens the term column and the three other tracks share the rest. The requirement now states that exception, and the "Default layout" scenario excludes it and a set term width.
- **Wide layout**: a set `dtWidth` replaces the equal halves with that width, and a resizable list at rest keeps its term column at least as wide as its minimum. The equal halves now hold only without a term width and, for a resizable list, while the minimum fits in one half; the "Equal columns" scenario names those conditions.
- **Resizable term column**: the separator sits at the end of the box it resizes, which is held between the term minimum and maximum once `dtWidth` is set and can differ from the term column. The requirement now refers to "Separator semantics" for that case.
- **Minimum column widths**: when there is no room to resize, a term column resting wider than its minimum still narrows to it on the first drag, key or double-click. The "No room to resize" scenario now says that every width the list writes is the minimum.
- **Separator cursor**: the cursor is computed only when the list writes or clamps the width, measures its size or sees a minimum change. It is `col-resize` until then and after a double-click restores the default ratio, even with no room to resize. The requirement states this, the "No room" scenario waits for a measurement, and a new scenario covers the restore.
- **Resizing with the keyboard**: the arrow keys start from the rendered width of the box the separator resizes, the value of `aria-valuenow`, which can differ from the term column. The requirement now says so.
- **Right-to-left direction**: the direction comes from the nearest CDK `dir` directive, else from the document's `dir` read once, so a plain `dir` attribute does not mirror the list. A runtime change reaches the drag and the arrow keys at once but the boundary cursor only when it is next computed. The requirement states both, with a new scenario for the runtime change.
- **Separator semantics**: `aria-valuenow` reports the rendered width of the box the separator resizes, not the term column, and the two differ while a `dtWidth` outside the bounds waits for its clamp. The requirement says so, with a new scenario.
- **Localized strings**: `[localeOverrides]` reaches the lists nested in the content of the list that binds it. The requirement and the "Overriding one list" scenario now include them.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `dl`: corrects the requirements "Terms and descriptions", "Default column ratio", "Wide layout", "Resizable term column", "Minimum column widths", "Separator cursor", "Resizing with the keyboard", "Right-to-left direction", "Separator semantics" and "Localized strings" to match the code.

## Impact

Only OpenSpec files: `openspec/changes/correct-dl-baseline/` now, and `openspec/specs/dl/spec.md` once the change is archived. No source, test, example or documentation file changes.
