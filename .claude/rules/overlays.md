---
paths:
    - 'packages/components/core/overlay/**'
    - 'packages/components/core/pop-up/**'
    - 'packages/components/core/select/**'
    - 'packages/components/{app-switcher,autocomplete,datepicker,dropdown,list,modal,navbar,popover,select,sidepanel,timepicker,toast,tooltip,tree,tree-select}/**/*.ts'
---

# Overlays, panels and lists

- Overlays render in the browser top layer, so z-index and DOM placement do not stack them. Code that moves an overlay host takes it out of the top layer the way `KbqOverlayLayerRegistry` does (`core/overlay/overlay-layer.ts`).
- After an imperative `overlayRef.attach()`, call `overlayRef.updatePosition()`: without zone.js the pane sits at (0,0) for a frame and takes the pointer's hover.
- `ScrollDispatcher` is app-wide: every registered `CdkScrollable`, `KbqScrollbarViewport` included, reaches every overlay that closes on scroll. Filter out inner scrolls when subscribing to `scrolled()`.
- Measure an element's offset inside a scrollport with `getBoundingClientRect()` plus `scrollTop`/`clientTop`, not by walking `offsetParent`: scrollports are usually not positioned. Compare "scrolled to the bottom" with a 2px tolerance, and never detect a scroll boundary by reading `scrollLeft` back, because offsets snap to device pixels.
- Focus items in scrollable panels with `{ preventScroll: true }` and scroll them explicitly: WebKit applies the scroll that focus implies a frame later and undoes any scrolling done in between. Avoid `Element.scrollIntoView()` inside overlays, which also scrolls the document.
- When several nested triggers share one `kbq-dropdown`, pass each trigger's data with `[kbqDropdownTriggerData]` and `<ng-template kbqDropdownContent>`. State written on hover and cleared on `(closed)` opens an empty panel: the safe area delivers `closed` after the next trigger's `mouseenter`.
- CDK `SelectionModel` fixes `multiple` when it is constructed. Switching the mode means a new model, resubscribing to `changed` and repairing each option's `_selected` mirror. Tree-select shares its model with the tree, so replace a model only when it is the component's own.
