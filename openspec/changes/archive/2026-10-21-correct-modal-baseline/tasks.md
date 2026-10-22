# Tasks

No source, test or docs file changes in this change. Each task re-reads the evidence behind one corrected requirement in `specs/modal/spec.md`.

## 1. Verify the corrections

- [ ] 1.1 "Motion": in `packages/components/modal/modal.component.ts`, verify that `animateTo()` with `animationsDisabled` waits for `afterNextRender` only while `viewInitialized` is `false` and returns `Promise.resolve(null)` otherwise, so `afterClose` emits in a microtask after `close()`
- [ ] 1.2 "Teardown of a service dialog": in `modal.service.ts`, verify that the overlay is created with `disposeOnNavigation: true`, and in the CDK's `OverlayRef.attach()` that this subscribes to `Location.subscribe()`, which Angular's `Location` feeds only from `onPopState`
- [ ] 1.3 "Tracking open dialogs": in `modal-control.service.ts` and `modal.component.ts`, verify that `registerModal()` runs only in `ngOnInit()` and that `removeOpenModal()` calls `unregister()` on the first `afterClose`, so a declarative dialog opened again is never pushed to `openModals`
- [ ] 1.4 "Confirm layout": in `modal.component.html`, verify that the confirm template renders no header and ignores `kbqFooter`, and in `modal.component.ts` that `hasFooter`, which drives `kbq-modal_no-footer`, counts `kbqFooter` in every layout
- [ ] 1.5 "One dim layer for stacked dialogs": in `modal-control.service.ts`, verify that `handleMultipleMasks()` reads the dialogs from `registeredMetaMap`, which no longer holds a declarative dialog after its first close
- [ ] 1.6 "Page behind the dialog is inert": verify that `syncBackgroundInert()` runs only from `setVisible()`, and that for a declarative dialog shown from its first render `ngOnChanges()` calls `setVisible()` before `ngOnInit()` moves the element into its overlay
- [ ] 1.7 "Explicit width" and "CSS unit pipe": in `css-unit.pipe.ts`, verify that the pipe converts with unary plus, so `''` and a blank string give `0px`, and in `modal.component.html` that `kbqWidth` reaches `[style.width]` through the pipe
- [ ] 1.8 Run `openspec validate correct-modal-baseline --strict` and verify it passes

## Workflow follow-up

- Archive the change with `/opsx:archive`, which merges the corrected requirements into `openspec/specs/modal/spec.md`.
