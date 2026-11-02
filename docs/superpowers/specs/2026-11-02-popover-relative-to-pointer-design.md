# Popover Relative to Pointer Design

## Intent

DS-5359 adds an opt-in popover mode that opens at the clicked point of a long trigger and keeps the arrow aimed at that point, including after CDK flips or pushes the panel at a viewport edge. The related AM-23173 scenario is a line containing several owner names: the panel must identify the clicked name rather than the center of the whole line. DS-5358 already owns arrow visibility and is out of scope.

## Goals

- Add `kbqRelativeToPointer` to `KbqPopoverTrigger`, defaulting to `false`.
- Anchor real pointer clicks to a zero-size rectangle at `clientX`/`clientY`.
- Keep the point attached to the trigger while the page or an ancestor scrolls.
- Support every existing placement and fallback.
- Move the arrow along the panel edge after CDK positioning so its tip aims at the point as closely as the panel bounds allow.
- Preserve keyboard, programmatic, hover/focus and explicit-origin behavior.

## Non-goals

- Changing default popover positioning or offset.
- Adding cursor tracking while the pointer moves without a click.
- Reworking CDK positioning or introducing Floating UI.
- Changing arrow colors, shadows or visibility.
- Adding a new public geometry helper.

## Constraints

- Reuse `KbqOverlayOrigin`, `kbqCreateCaretOrigin` and `FlexibleConnectedPositionStrategy`; no dependency is added.
- The input name matches tooltip's `kbqRelativeToPointer`; on a host carrying both directives it configures both, like the already shared `kbqTrigger`.
- `kbqPopoverOrigin` wins over cursor positioning when it is non-`null`.
- Only a click with `MouseEvent.detail > 0` is a pointer open. Keyboard and programmatic `.click()` produce `detail === 0` and must not anchor at `(0, 0)`.
- Keyboard, programmatic and hover/focus opens use the configured origin or host. A stale mouse event must never affect a later open.
- The existing 8px popover offset remains unchanged.
- Public API, JSDoc, EN/RU documentation, API guards and generated docs metadata follow repository rules.
- Do not commit or push unless explicitly requested.

## Approach

### Pointer origin

The shared pop-up listener records the click `MouseEvent` in addition to `mouseenter`. `KbqPopoverTrigger.show()` consumes the click event once. For a pointer open it stores an offset from the host rectangle; otherwise it clears that offset before creating a new overlay.

A private dynamic origin created with `kbqCreateCaretOrigin` measures the current host rectangle and adds the stored offset, returning `{ x, y, width: 0, height: 0 }`. This keeps the clicked point in the same place relative to the host during scrolling and layout movement. `getResolvedOrigin()` and `getAnchorSize()` prefer an explicit `kbqPopoverOrigin`, then the active pointer origin, then the host.

A second real click while the same popover is open updates the offset and reapplies positioning. A programmatic re-show of an already attached popover leaves the current origin untouched.

### Exact arrow

An internal pure geometry helper calculates translation from the resolved placement, panel rectangle and pointer point. Horizontal placements (`top`/`bottom` families) translate only on X; vertical placements (`left`/`right` families) translate only on Y.

The desired arrow center is the pointer coordinate clamped to the panel interval `[edge + 30px, oppositeEdge - 30px]`, where 30px is the existing 24px arrow inset plus half of its 12px layout size. The returned shift is the difference between that clamped center and the placement's default arrow center. Panels narrower than 60px use their center as the sole allowed position.

`KbqPopUp` gets a docs-private no-op `updateArrowPosition()` hook called after position-driven change detection. `KbqPopoverComponent` overrides it, clears stale shifts when there is no active pointer or arrow, and otherwise writes `--kbq-popover-arrow-shift-x` and `--kbq-popover-arrow-shift-y` on `.kbq-popover`. The arrow's individual CSS `translate` property consumes the variables while its existing `transform: rotate(45deg)` remains intact.

### Documentation and verification

A docs example demonstrates clicking different parts of one long trigger. Unit specs cover event filtering, origin precedence, scrolling and pure geometry. Playwright covers repeated clicks, keyboard fallback, scrolling, viewport-edge arrow alignment and light/dark screenshots generated in Docker.

## Alternatives

- **Input without exact arrow correction:** smaller, but rejected because CDK `withPush` leaves the arrow pointing away from the clicked name near viewport edges.
- **Documentation-only use of `kbqPopoverOrigin`:** no runtime change, but every consumer would reimplement event filtering, scrolling and repeated-click behavior; rejected for a common library scenario.
