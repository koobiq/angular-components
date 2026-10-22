# Tasks

No source, test or docs file changes in this change. Each task re-reads the evidence behind one corrected requirement in `specs/dropdown/spec.md`.

## 1. Verify the corrections

- [ ] 1.1 "Close reasons": in `packages/components/dropdown/dropdown.component.ts`, verify that `close()` picks `'keydown'` only for the `keyboard` focus origin, that `handleKeydown` sets that origin for every key `isVerticalMovement` in `packages/components/core/keycodes/keycodes.ts` accepts, Page Up and Page Down included, and that `init()` in `dropdown-trigger.directive.ts` skips `focusFirstItem`, which sets the origin, when `autoFocus` is off
- [ ] 1.2 "Scrolling the page": verify that `KbqRepositionScrollStrategy` in `packages/components/core/overlay/reposition-scroll-strategy.ts` repositions only on `ScrollDispatcher.scrolled()`, whose global listener is a non-capturing `scroll` listener on the document, so an unregistered ancestor's scroll never reaches it
- [ ] 1.3 "Focus restored on closing": in `dropdown-trigger.directive.ts`, verify that the trigger's mouse-press handler overwrites `openedBy` on every press, open or not, and that `destroy()` restores focus with that value through `focus()`
- [ ] 1.4 "Focus across nested panels": in `destroy()` and `closeFromPanel()` of `dropdown-trigger.directive.ts`, verify that `ownsFocus` is true for a nested trigger without `openedBy` even when the chain closes, so its trigger item is focused before the parent's `closeChain` runs
- [ ] 1.5 "Navigation wrap": in `dropdown.component.ts`, verify that `configureKeyManager` reads `navigationWithWrap` only when `initKeyManager` first builds the focus or the active-descendant manager, and that the `inSearchMode` effect builds the second one on the first mode switch
- [ ] 1.6 "Inactive secondary action": in `dropdown-item-action.ts`, verify that the effect stores `null` for an action without a `tabindex` attribute and therefore never restores or removes the `-1` it set
- [ ] 1.7 "Nested panel position": in `setPosition()` of `dropdown-trigger.directive.ts`, verify that the vertical fallback of a nested panel with `yPosition: 'below'` aligns the bottoms with an offset of `+4`, and that the four `offsetX` values are `-8`, `+8`, `-8` and `-8`
- [ ] 1.8 "Search field": in `dropdown.component.ts`, verify that `inOverlay.set(true)` runs once in `ngAfterContentInit` on the first `contentChild(KbqFormField)` match, and that the `directDescendantItems.changes` subscription highlights the first item whenever no item is active and the field holds a query
- [ ] 1.9 "Width of a panel with a form field": in `lockOverlayWidthForSearch()` of `dropdown-trigger.directive.ts`, verify that it returns early when `shouldMatchTriggerWidth` is false, which it is for nested panels and for `overlapTriggerY` without `overlapTriggerX`
- [ ] 1.10 "Invalid positions": in the constructor of `dropdown.component.ts`, verify that the validation effect skips a value equal to the starting `xPosition` or `yPosition`
- [ ] 1.11 "Overlapping the trigger": in `positionMap` of `dropdown-trigger.directive.ts`, verify that `xPositions.center` and `nonOverlapXPositions.center` are the same entry
- [ ] 1.12 "Explicit panel width": in `openPanel()` and `getOverlayConfig()` of `dropdown-trigger.directive.ts`, verify that the pane size from `kbqResolvePanelWidth` is applied only when `shouldMatchTriggerWidth` is true
- [ ] 1.13 "Panels not matched to the trigger": in `panelMinWidthToken` of `dropdown.component.ts`, verify that an explicit `panelWidth` sets the token to `0px` for every panel, nested ones included
- [ ] 1.14 Run `openspec validate correct-dropdown-baseline --strict` and verify it passes

## Workflow follow-up

- Archive the change with `/opsx:archive`, which merges the corrected requirements into `openspec/specs/dropdown/spec.md`.
