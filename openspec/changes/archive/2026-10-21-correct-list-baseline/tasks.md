# Tasks

No source, test or docs file changes in this change. Each task re-reads the evidence behind one corrected requirement in `specs/list/spec.md`. Paths are under `packages/components/`, line numbers as of `c9c196a9b`.

## 1. Verify the corrections

- [ ] 1.1 "Plain click toggles without autoSelect": in `list/list-selection.component.ts` (`setSelectedOptionsByClick`, around line 985), verify that without `autoSelect` a plain click calls `selectionModel.toggle()`, and that the CDK `SelectionModel` built for single selection deselects the previous option when it selects another
- [ ] 1.2 "Shift click selects a range": verify that `selectActiveOptions()` (around line 1023) anchors on `keyManager.previousActiveItemIndex`, that `setActiveItem()` in `core/a11y/key-manager/list-key-manager.ts` (line 218) sets it while `updateActiveItem()` does not, that the option blur handler in `listenToOptionsFocus()` calls `setActiveItem(-1)` once focus has left the list, and that the range skips a deselection while `noUnselectLast` is on and one option is selected
- [ ] 1.3 "Angular forms integration": verify that `selectAll()`, `deselectAll()` (around line 952) and the narrowing in `rebuildSelectionModel()` through `scheduleValueReport()` call `reportValueChange()`, which calls the registered `onChange`, and that the `@angular/forms` view-change callback marks the control dirty on every call
- [ ] 1.4 "Selecting everything in code": verify that `selectAll()` calls `setSelected(true)` on every option, so a single-selection model keeps only the last one
- [ ] 1.5 "Select-all row rendering": verify that `warnOnUnsupportedSelectAllContainer()` (around line 1424) is called only from `ngAfterContentInit()` (line 885), while `showSelectAll` (around line 394) re-reads the inputs and the viewport query on every check
- [ ] 1.6 "Action button visibility": in `core/option/_action-container-mixins.scss`, verify that the hover rule and the `cdk-keyboard-focused` + `kbq-focused` rule reveal the action container independently of each other, as `list/list.scss` (line 126) includes them
- [ ] 1.7 "Single tab stop": in `core/a11y/leave-tab-order.ts`, verify that the host tab index is restored by a `setTimeout` (line 33) whatever element holds focus by then
- [ ] 1.8 "Focus on entering the list": verify that `focus()` of the list (around line 919) calls `focus()` on the first option whose `selected` is true, and that `KbqListOption.focus()` (around line 2176) returns without moving focus for a disabled option
- [ ] 1.9 "Keyboard navigation" and "Shift and an arrow select a range": verify in `onKeyDown()` (around line 1169) that the list itself handles `Down`/`Up` only when vertical and `Right`/`Left` only when horizontal, that the remaining arrow keys go to the key manager, whose orientation is fixed in `ngAfterContentInit()`, and that a vertical list's `Left`/`Right` do not move the active option
- [ ] 1.10 "Page navigation": in `core/a11y/key-manager/list-key-manager.ts`, verify that `setNextPageItemActive()` (line 348) and `setPreviousPageItemActive()` (line 358) fall back to the page size as the step of `setActiveItemByIndex()` (line 443), which returns without moving once the step runs past the end
- [ ] 1.11 "Custom select-all handler": verify that `onKeyDown()` calls `selectAllHandler` only under `this.multiple && isSelectAll(event)`
- [ ] 1.12 "Drop indicator" and "Drop forbidden feedback": verify that `onOptionDragMoved()` (around line 1489) only considers the option's own list and the instances from `resolveConnectedLists()`, that `containsPoint()` requires a draggable list, that the forbidden class is toggled on when none of them is hovered, and that `showDropIndicator()` measures along `horizontal()`
- [ ] 1.13 "Drag cursor": in `list/list.scss`, verify that the row's grab cursor (line 138) is excluded by `:not(:has(.cdk-drag-handle))` while the handle gets it (line 130), and that `no-drop` (line 118) outranks `grabbing` (line 89)
- [ ] 1.14 Run `openspec validate correct-list-baseline --strict` and verify it passes

## Workflow follow-up

- Archive the change with `/opsx:archive`, which merges the corrected requirements into `openspec/specs/list/spec.md`.
