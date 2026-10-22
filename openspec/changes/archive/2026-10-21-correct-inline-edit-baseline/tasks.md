# Tasks

No source, test or docs file changes in this change. Each task re-reads the evidence behind one corrected requirement in `specs/inline-edit/spec.md`.

## 1. Verify the corrections

- [ ] 1.1 "Mode and its host classes": verify that `mode` in `packages/components/inline-edit/inline-edit.ts` is a `model()`, and that `createModelSignal()` in `@angular/core` emits its output only from `set()` and `update()`, while a value bound to the input is applied without emitting
- [ ] 1.2 "Edit panel placement": in `inline-edit.ts`, verify that `setOverlayWidth()` returns before it subscribes to the resize observer when `editModeWidth` is set; in `core/overlay/overlay-layer.ts`, verify that `findLayer()` skips a layer that contains the `kbqOverlayLayerExclude` element closest to the origin
- [ ] 1.3 "Click outside the panel": verify that the `_clickListener` of the CDK `OverlayOutsideClickDispatcher` stops at the first overlay, from the topmost down, that listens for outside clicks and contains the target, and that `kbq-select`, `kbq-tree-select`, the datepicker and the dropdown subscribe to `outsidePointerEvents()` of their own overlay while open
- [ ] 1.4 "Validation tooltip waits for the field to be in view": in `showValidationTooltip()`, verify that the fallback timeout leaves `validationTooltipScrollHandle` installed, that only a scroll end event or the overlay detaching cancels it, and that a rejected save returns at once while it is installed; the unit test that keeps the scroll end listener until the overlay detaches confirms the handle outlives the fallback
- [ ] 1.5 "Restoring the value of the form fields": in `setValue()`, verify the early return for a value that is not an array when `setValueHandler` is not bound, and that `getValue()` returns the result of `getValueHandler` as is
- [ ] 1.6 "Failed state persists": verify that `startSave()` sets `saveStatus` to `pending` before subscribing, and that the specs "should keep the failed state while the rejected value is edited again" and "should repeat the request on retrySave and do nothing without a failed save" assert `pending` right after the new request starts
- [ ] 1.7 "Rolling back a failed save": verify that `onAttach()` sets `lastSavedValue` to the opening value whenever `saveStatus` is not `error`, that `onSaveSucceeded()` sets it to the submitted value, and that `rollback()` restores it
- [ ] 1.8 "Focus return after editing": verify that the panel in `inline-edit.html` carries `cdkTrapFocusAutoCapture`, that `CdkTrapFocus` in `@angular/cdk/a11y` stores the focused element in `ngAfterContentInit()` and focuses it in `ngOnDestroy()` without a condition, and that `restoreFocus()` skips only its own deferred move when focus is elsewhere
- [ ] 1.9 "Focus classes of the host": in `inline-edit.scss`, verify that `.kbq-inline-edit_anchor-focused` alone draws the ring, and in `inline-edit.html` that the anchor sets it on every `focus` event, whatever the origin
- [ ] 1.10 "Edit panel adds no tab stops": verify that `inline-edit.html` renders two `kbq-button` buttons in the panel when `showActions` is set, and that the Playwright test "takes focus back when nothing focusable follows the field" tabs onto both
- [ ] 1.11 Run `openspec validate correct-inline-edit-baseline --strict` and verify it passes

## Workflow follow-up

- Archive the change with `/opsx:archive`, which merges the corrected requirements into `openspec/specs/inline-edit/spec.md`.
