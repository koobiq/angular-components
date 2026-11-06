# Proposal

## Why

The baseline spec of `ellipsis-center` states behaviour the code does not have. A static audit of `openspec/specs/ellipsis-center/spec.md` against `packages/components/ellipsis-center`, the tooltip trigger it extends and the shared pop-up base in `packages/components/core` on `c9c196a9b` found three requirements whose wording the source contradicts; this change corrects them so the spec describes what ships.

## What Changes

- **Tail length follows the host width and the glyph width**: a `charWidth` above the measured width per character does not always shorten the tail. The count is rounded and clamped to at least one character, so a slightly larger `charWidth`, or a host narrow enough for the clamp, gives the same tail as the measurement alone; the delta states "never lengthens, shortens only when it lowers the count" and gives worked numbers.
- **Tooltip does not capture the pointer by default**: `ignoreTooltipPointerEvents` is read once, when the first opening creates the overlay, and the pane is reused, so binding it to `false` after the tooltip has opened leaves the pane ignoring pointer events.
- **Full text stays available to assistive technology**: the open tooltip skips `aria-describedby` only while the host's trimmed text content equals the trimmed full text; other content of the host that adds text makes the two differ, and the tooltip's id is then added.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `ellipsis-center`: corrects the requirements "Tail length follows the host width and the glyph width", "Tooltip does not capture the pointer by default" and "Full text stays available to assistive technology".

## Impact

Only OpenSpec files: the delta under `openspec/changes/correct-ellipsis-center-baseline/` and, once archived, `openspec/specs/ellipsis-center/spec.md`. No source, test, documentation or public API changes.
