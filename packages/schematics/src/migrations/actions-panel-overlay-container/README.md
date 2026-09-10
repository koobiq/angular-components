# actions-panel-overlay-container

Migration schematic invoked automatically by `ng update @koobiq/components@20`
(registered for `20.3.0-0`). Reports the call sites that `KbqActionsPanelConfig.overlayContainer`
gives a new meaning to. It never writes to the tree.

## Background

`overlayContainer` was documented as the element the panel is displayed in, but it only anchored the
positioning: CDK resolves the overlay host from the single `OverlayContainer` its `Dialog` was
injected with, so the overlay itself stayed in the application-wide container. Every panel on a page
therefore shared one container, and anything that relocated that container — a
`FullscreenOverlayContainer`, for one — took all of them along with it.

The panel now gets a `Dialog` of its own from a child environment injector, backed by an
`OverlayContainer` scoped to the element, and renders inside it.

## What changes for a call site

- The panel is inside the element rather than floating above the page. An element with
  `overflow: hidden` clips it; an element that scrolls its own content scrolls it out of view,
  because the overlay is positioned against the content rather than against the visible area.
- The element is mutated while the panel is open: it gains one child node holding the overlay, and a
  `static` element is promoted to `position: relative`. That shifts `:empty`, `:last-child`,
  `:nth-last-child()` and `childElementCount`.
- `maxWidth` used to be ignored whenever `overlayContainer` was set — the panel was capped at the
  container's measured width. It is applied as given now.
- A panel opened with the option no longer uses a globally provided `OverlayContainer`. Both
  settings answer "where is the panel rendered", and the per-panel one wins.

## Why warn-only

None of it can be rewritten automatically. Whether a panel that now sits inside a bordered, clipping
or scrolling element is still where the product wants it is a layout question, not a syntactic one,
and the fix ranges from doing nothing to moving the option to a different element.
