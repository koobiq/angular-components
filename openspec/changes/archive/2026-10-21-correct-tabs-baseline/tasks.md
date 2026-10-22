# Tasks

No source, test or docs file changes in this change. Each task re-reads the evidence behind one corrected requirement in `specs/tabs/spec.md`.

## 1. Verify the corrections

- [ ] 1.1 "Only the selected tab's content is in the DOM": in `packages/components/tabs/tab-body.component.ts`, verify that `KbqTabBodyPortal` detaches the content only on `afterLeavingCenter`, which `translationDone()` emits once `kbqAnimationsSettled()` has settled for the transition of `tab-body.scss`
- [ ] 1.2 "Pointer selection": in `tab-group.component.ts`, verify that `onSelectFocusedIndex()` in string mode assigns `tabs.get(index)?.tabId() || null`, so a tab without a `tabId` leaves `activeTab` empty and `getDefaultTab()` selects the first enabled tab, while `handleClick()` still sets `focusIndex` to the clicked label
- [ ] 1.3 "Selection change events": in `ngAfterContentInit()` of `tab-group.component.ts`, verify that the `tabs.changes` subscriber moves `selectedIndexState` to the kept tab, so `ngAfterContentChecked()` sees no change (test "should not fire `selectedTabChange` when the amount of tabs changes"), and that a first check without tabs sets the index to 0, so tabs arriving later at another index emit
- [ ] 1.4 "Value emitted by activeTabChange": in `ngAfterContentChecked()` of `tab-group.component.ts`, verify that `activeTabChange` emits `attributeToSelectBy` itself unless it is a function that returned a tab, and that a bound `undefined` assigns `null` to `activeTab` in `ngOnChanges()`
- [ ] 1.5 "Active flag of a tab": in `ngAfterContentChecked()` of `tab-group.component.ts`, verify that `isActive` is written only inside the branch taken when the computed index differs from `selectedIndexState`, and that the `tabs.changes` subscriber finds no active tab for the first tabs of a group that rendered empty or after the selected tab was removed
- [ ] 1.6 "Selection survives a change of the tab list": in `tab-group.component.ts`, verify that the `tabs.changes` subscriber keeps the tab only when `getTabIndexToSelect()` returns the old index, which a `tabId` that moved does not, and that the `activeTab` getter falls back to `tabs.get(0)` for a `tabId` no tab has
- [ ] 1.7 "Header position": in `dist/scss-compiled/tabs/tab-group.css` (or `tab-group.scss`), verify that `kbq-tab-group_inverted-header` and `kbq-tab-group_vertical` set `flex-direction` with equal specificity and the vertical rule comes last
- [ ] 1.8 "Stretched and aligned labels": in `tab-link.scss` and `dist/scss-compiled/tabs/tab-link.css`, verify that the stretch rule compiles to `.kbq-tab-link .kbq-tab-group_stretch-labels .kbq-tab-link`, which needs a link around the nav bar, and that `tab-header.scss` stretches only `.kbq-tab-label`
- [ ] 1.9 "Switch animation": in `tab-body.component.ts` and `tab-body.scss`, verify that a positive position (a later tab) maps to `right` in a left-to-right layout and `left` in a right-to-left one, and that `right` translates the content by `100%` (tests "should be right position with positive position" and "should be left position with positive position")
- [ ] 1.10 "Arrow keys move focus": in `paginated-tab-header.ts`, verify that the `selectedIndex` setter calls `keyManager.updateActiveItem()`, that `handleKeydown()` moves from `keyManager.activeItemIndex`, and that nothing in the tab group updates the key manager on `focusin`, while `getTabIndex()` in `tab-group.component.ts` gives the tab stop to the first enabled label when that index is disabled
- [ ] 1.11 "Manual activation": in `paginated-tab-header.ts`, verify that Enter and Space emit `selectFocusedIndex` with `focusIndex`, the key manager's index, and that the tab group handles it in `onSelectFocusedIndex()` as in 1.2
- [ ] 1.12 "Focus moves next to a removed tab": in the constructor of `paginated-tab-header.ts`, verify that `focusout` clears `focusWasInside` only for a `relatedTarget` outside the strip, and that `restoreFocusAfterItemsChange()` then focuses a label whenever `document.activeElement` is not one
- [ ] 1.13 "Nav bar without a panel": in `tab-nav-bar.ts`, verify that `ariaOrientation` returns `null` unless the role read back is `tablist` on a vertical nav bar, that a `null` attribute binding removes the attribute, and that `role`, `ariaSelected` and `ariaControls` read the element back once `tabNavPanel` is unset
- [ ] 1.14 "Application-driven selection is not persisted": in `tab-group.component.ts`, verify that `controlled` is fixed in `restoreState()`, that the `selectedIndex` and `activeTab` setters do not call `saveState()`, and that the `tabs.changes` subscriber calls `onSelectFocusedIndex()`, which does
- [ ] 1.15 "Group outside the document": in `tab-group.component.ts` and `core/state-saving/state-saving.ts`, verify that `persists` reads `host.isConnected` on every call, that `snapshot()` warns before `KbqStateSaving.write()` runs, and that `write()` refuses a key while `readKey` is still `null`
- [ ] 1.16 Run `openspec validate correct-tabs-baseline --strict` and verify it passes

## Workflow follow-up

- Archive the change with `/opsx:archive`, which merges the corrected requirements into `openspec/specs/tabs/spec.md`.
