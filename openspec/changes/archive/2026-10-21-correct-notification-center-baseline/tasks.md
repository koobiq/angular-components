# Tasks

No source, test or docs file changes in this change. Each task re-reads the evidence behind one corrected requirement in `specs/notification-center/spec.md`.

## 1. Verify the corrections

- [ ] 1.1 "Overlay pane classes": in `packages/components/notification-center/notification-center.ts`, verify that `overlayConfig` reads `panelClass()`, and in `core/pop-up/pop-up-trigger.ts` that `createOverlay()` returns the existing `overlayRef` when there is one and that `detach()` detaches the overlay without disposing it, so the config of the first open is reused
- [ ] 1.2 "Side placement by default": verify the placement priority `right`, `rightBottom`, `rightTop` in the trigger's constructor, `withPush(true)` in its `updatePosition()`, the default `height: var(--kbq-notification-center-popover-height, 100vh)` in `notification-center.scss`, and in `FlexibleConnectedPositionStrategy.apply()` of `@angular/cdk` that the first position fitting the viewport wins and otherwise the one with the largest visible area is pushed
- [ ] 1.3 "Placement change output": in `_applyPosition()` of the CDK position strategy, verify that `positionChanges` emits only for a position other than the last one or a changed scroll visibility, and that `withPositions()` with the new array built by `getAdjustedPositions()` on every open clears the last position
- [ ] 1.4 "Outside click closes the panel": in the CDK `OverlayOutsideClickDispatcher`, verify that an overlay without `outsidePointerEvents()` subscribers is skipped rather than ending the walk; verify that `KbqDropdownTrigger.closingActions()` subscribes to it and that `KbqToastService.createOverlay()` does not, while `toTop()` raises the toast stack above every overlay
- [ ] 1.5 "Bottom rows are scrolled into view": in `subscribeToRevealLoadMoreRow()` of `notification-center.ts`, verify that `scrollToBottom()` runs only on a `false` to `true` transition of `loadingMore()` or `loadMoreErrorMode()`, compared with the value read when the panel rendered, and that the template shows the error row only while `loadingMore()` is `false`
- [ ] 1.6 "Focus after deletion": in `restoreFocusAfterRemove()`, verify that the index is taken from `document.activeElement` among the row and group delete buttons, and that an index of `-1` focuses the list; in the unit test "moves focus to a delete button next to the removed one, never to the topmost group", verify that the button is focused before it is clicked
- [ ] 1.7 "Popover mode": verify the priority `bottomCenter`, `bottomLeft`, `bottomRight` set by the `popoverMode` setter, `withPush(true)`, and the popover height `calc(100vh - var(--kbq-notification-center-size-navbar-height))` with its vertical margins in `notification-center.scss`
- [ ] 1.8 "Test ids": verify that the `host` of `KbqNotificationCenterComponent` sets no `data-testid`, that `kbq-notification-center-container` sits on the list viewport in `notification-center.html`, and that the Playwright spec locates the panel by its class
- [ ] 1.9 Run `openspec validate correct-notification-center-baseline --strict` and verify it passes

## Workflow follow-up

- Archive the change with `/opsx:archive`, which merges the corrected requirements into `openspec/specs/notification-center/spec.md`.
