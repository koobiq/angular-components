# Tasks

No source, test or docs file changes in this change. Each task re-reads the evidence behind one corrected requirement in `specs/actions-panel/spec.md`.

## 1. Verify the corrections

- [ ] 1.1 "Closing only once": in `packages/components/actions-panel/actions-panel-ref.ts`, verify that `close()` returns early only once `containerInstance` is cleared, which only `close()` itself does, and that `handleOverlayDetachments()` closes the `DialogRef` without it; in `@angular/cdk` `dialog.mjs` and the overlay chunk, verify that `Dialog.closeAll()` and `disposeOnNavigation` dispose the overlay without going through the reference
- [ ] 1.2 "Close button" and "Escape closes the panel": in `actions-panel-container.ts`, verify that the close button and `handleEscape()` call `close()` on the injected `KbqActionsPanel` and that `handleEscape()` returns on `defaultPrevented` or `disableClose`; in `actions-panel.ts`, verify that the container's injector is parented on `config.injector || this.injector`; in `@angular/platform-browser`, verify that `KeyEventsPlugin.matchEventFullKeyCode()` rejects `keydown.escape` with Alt, Control, Meta or Shift held
- [ ] 1.3 "Pop-ups of the content are not scoped to the element": in `packages/components/core/overlay/overlay-layer.ts`, verify that `findLayer()` skips a layer whose host contains the `.cdk-overlay-container` the origin sits in; verify that `dropdown-trigger.directive.ts` adopts its overlay with the trigger as origin; re-read the `overlay-layer.spec.ts` test "keeps a panel opened from an overlay container inside the element in the application-wide container"
- [ ] 1.4 "Size options": verify that the CDK overlay styles give `.cdk-overlay-pane` `max-width: 100%` and that `OverlayRef` writes `minWidth` to the pane's inline style, which wins over a smaller maximum width
- [ ] 1.5 "Text direction": in `actions-panel.ts` and `actions-panel-config.ts`, verify that the merged configuration has no `direction` when the provided default configuration leaves it out; in CDK `createOverlayRef()`, verify that the overlay then takes `Directionality.value`; in `actions-panel-container.ts`, verify that the RTL class binding compares `config.direction` with `'rtl'`
- [ ] 1.6 Run `openspec validate correct-actions-panel-baseline --strict` and verify it passes

## Workflow follow-up

- Archive the change with `/opsx:archive`, which merges the corrected requirements into `openspec/specs/actions-panel/spec.md`.
