# Proposal

## Why

The baseline spec of `scrollbar` states behaviour the code does not have. A static audit of `openspec/specs/scrollbar/spec.md` against `packages/components/scrollbar` at `c9c196a9b` found ten requirements that claim more than the source does, in the edge cases they leave out; the corrections describe what ships.

## What Changes

- **No bar for an axis the user cannot scroll**: the content observer watches mutations inside the scrolling element only, so an `overflow` change made from outside, such as a class on an ancestor, adds or removes no bar until the next scroll, hover or focus. The requirement now scopes the immediate update to changes of the element's own attributes.
- **Bars follow content changes**: a style applied from outside is noticed only when it resizes the scrolling element or a box directly inside its content; one that grows only the content of an inline element waits for a scroll, hover or focus, as the observer's own JSDoc says. The requirement now lists what is observed and what waits.
- **Scrolling to offsets**: `start` and `end` are resolved by CDK's `CdkScrollable.scrollTo`, which reads only `Directionality`, so a bare `dir="rtl"` on an ancestor other than `html` or `body` is not seen. The requirement now names that source of the direction.
- **Scrolling to the horizontal edges**: for the same reason, under a bare `dir="rtl"` without the `Dir` directive both methods resolve as in a left-to-right layout and `scrollEnd()` cannot reach the left edge. The requirement now says so.
- **Scrolling to an element**: the target's offset is summed along its `offsetParent` chain, which skips a non-positioned `kbqScrollbarViewport` host, so the request also counts the host's own offset. The requirement now limits the alignment to a positioned scrolling element.
- **Centering an element**: `scrollIntoView` measures the target the same way, with the same limit. The requirement now states it.
- **Bar gestures do not click the content**: the suppression arms on the next mouse-up event in the window, so a press whose release never reaches the window as a mouse-up event stops the click that follows the next one instead. The requirement now describes that case.
- **Thumb size and position**: the room left for a minimum-size thumb is computed from the scrolling element's client size, not from the bar, which is about 15 px shorter than that when both bars are drawn, so the thumb then reaches a few pixels past the bar's end. The requirement now states both cases, and its end-of-range scenario names a single bar.
- **Track covers the visible area without taking space**: the track is one pixel smaller than the client size (asserted by a unit test), and as an in-flow first child it takes a grid cell or a flex `gap`. The requirement and the padded-viewport scenario now say so.
- **Track stacking**: the track competes with content inside a `kbqScrollbarViewport` host through `--kbq-scrollbar-track-z-index` (1000 by default), so content with a higher `z-index` paints above it; only the content wrapper of `kbq-scrollbar` isolates every `z-index`. The requirement now states the limit.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `scrollbar`: corrects the requirements "No bar for an axis the user cannot scroll", "Bars follow content changes", "Scrolling to offsets", "Scrolling to the horizontal edges", "Scrolling to an element", "Centering an element", "Bar gestures do not click the content", "Thumb size and position", "Track covers the visible area without taking space" and "Track stacking" to match the code.

## Impact

Only OpenSpec files: `openspec/changes/correct-scrollbar-baseline/` now, and `openspec/specs/scrollbar/spec.md` once the change is archived. No source, test, example or documentation file changes.
