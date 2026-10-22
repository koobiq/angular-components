# Tasks

No source, test or docs file changes in this change. Each task re-reads the evidence behind one corrected requirement in `specs/popover/spec.md`.

## 1. Verify the corrections

- [ ] 1.1 "Arrow alignment on small triggers": in `packages/components/core/pop-up/pop-up-trigger.ts`, verify that `getAdjustedPositions()` reads the trigger's `arrow` input, which a stuck panel leaves `true`, and that `getAnchorSize()` measures the origin when one is set; in the CDK `_setOverlayElementStyles()`, verify that the offsets become a `transform` of the pane
- [ ] 1.2 "Distance from the trigger": in `packages/components/popover/popover.component.ts`, verify that `applyPopupMargins()` runs only from the `visibleChange(true)` subscription of `KbqPopoverComponent`, and that `onPositionChange()` in `pop-up-trigger.ts` changes the placement class without writing the margin again
- [ ] 1.3 "Placement fallback": verify that `getPriorityPlacementStrategy()` in `pop-up-trigger.ts` returns an empty list for a value without any known name, and that the CDK `withPositions()` throws on it in dev mode and `apply()` fails on the missing fallback otherwise
- [ ] 1.4 "Following the page scroll" and "Closing on scroll": in the CDK `ScrollDispatcher`, verify that `scrolled()` listens to the document's own `scroll` event and to registered `CdkScrollable` instances only, and that `closingActions()` in `popover.component.ts` and the reposition strategy in `packages/components/core/overlay/reposition-scroll-strategy.ts` read nothing else
- [ ] 1.5 "Overlay layers": in `findLayer()` of `packages/components/core/overlay/overlay-layer.ts`, verify the skips for a `kbqOverlayLayerExclude` ancestor, for another overlay container inside the host and for a host outside the fullscreen element, and that the innermost host wins
- [ ] 1.6 "Sticking to a window edge": verify that `setStickPosition()` is called only on show, from `onPositionChange()` and on a viewport resize, and that the CDK `_applyPosition()` rewrites the pane insets on every re-apply but emits `positionChanges` only for a new position or a change of scroll visibility
- [ ] 1.7 "Confirming", "Opening and closing in code", "Escape on the trigger" and "Disabled popover": in `pop-up-trigger.ts`, verify that `canHide()` returns `false` while `triggerName` is `mouseleave` and the panel is hovered, and that the confirm handler, `hide()`, `updateVisible()`, `keydownHandler()` and the `disabled` setter all go through it, while `close()` in `popover.component.ts` does not
- [ ] 1.8 "Trigger events": verify that the host listeners of `KbqPopoverTrigger` for Escape and for the end of a touch are bound whatever `kbqTrigger` is, and that `initListeners()` binds no opening listener for `manual`
- [ ] 1.9 "Outside click closes a click popover": verify that `initListeners()` binds `blur` to `hide()` for a `focus` trigger while `closingActionsForClick()` returns no stream without `click`
- [ ] 1.10 "Focus returns to the trigger": verify that `restoreFocus()` is called only from the `visibleChange(false)` subscription of the panel, and that a panel destroyed by `OverlayRef.detach()`, as the CDK close scroll strategy does, completes `visibleChange` without emitting `false`
- [ ] 1.11 Run `openspec validate correct-popover-baseline --strict` and verify it passes

## Workflow follow-up

- Archive the change with `/opsx:archive`, which merges the corrected requirements into `openspec/specs/popover/spec.md`.
