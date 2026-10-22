# Tasks

No source, test or docs file changes in this change. Each task re-reads the evidence behind one corrected requirement in `specs/sidebar/spec.md`; component paths are under `packages/components/sidebar/`, state saving paths under `packages/components/core/state-saving/`.

## 1. Verify the corrections

- [ ] 1.1 "Content switch timing": in `sidebar.component.ts`, verify that `setOpened()` sets `internalState` only when it opens, leaving the closed content to the `kbqAfterAnimations` callback of `waitForStateAnimation()`, while `restoreState()`, run from the `keyChanges` subscription, sets `internalState` to the restored value at once before `waitForStateAnimation(true)` starts the transition
- [ ] 1.2 "Opened width bounds": in `sidebar.component.ts`, verify that `saveWidth()` replaces `openedStateWidth` with the host's `offsetWidth` in pixels whenever `opened` is assigned on an opened sidebar that is not toggling, that `restoreState()` replaces it with a stored `width`, and that neither touches `openedStateMinWidth` or `openedStateMaxWidth`; the unit test "restores the width alongside the opened state" shows `333px` while the content declares `200px`
- [ ] 1.3 "State saving on by default": in `state-saving.ts`, verify that `read()` and `writeState()` return early when the private `persists` getter is `false`, and that it requires `KbqStateSavingService.isEnabled()` as well as `useStateSaving()`
- [ ] 1.4 "Clearing the saved state": in `state-saving.ts`, verify that `clearState()` returns before removing anything while `useStateSaving()` is `false`, and that `clearSavedState()` in `sidebar.component.ts` only delegates to `clear()`
- [ ] 1.5 Run `openspec validate correct-sidebar-baseline --strict` and verify it passes

## Workflow follow-up

- Archive the change with `/opsx:archive`, which merges the corrected requirements into `openspec/specs/sidebar/spec.md`.
