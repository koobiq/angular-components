# Tasks

No source, test or docs file changes in this change. Each task re-reads the evidence behind one corrected requirement in `specs/toast/spec.md`.

## 1. Verify the corrections

- [ ] 1.1 "Line breaks in string slots": in `packages/components/toast/toast.component.html` and `toast.component.scss`, verify that a string caption without a title carries `kbq-toast__title` and `kbq-toast__text_only-text` but neither `kbq-toast__title_only-text` nor `kbq-toast__text`, so no `white-space: pre-wrap` rule matches it, while the title, the content and a caption below a title each match one
- [ ] 1.2 "Closing a toast": in `toast.component.ts` and `toast.service.ts`, verify that `close()` calls `hide()` of the stack, that `removeToast()` returns early for an id without a record, and that a toast created by a `kbq-toast-container` in a consumer's template resolves `KBQ_TOAST_STACK` to the root `KbqToastService`, which holds no record of it
- [ ] 1.3 "Hiding a toast by id" and "Read notification": verify that `removeToast()` in `toast.service.ts` calls `restoreFocus()` for a keyboard or programmatic focus, that the move fires `focusout` on the leaving toast with a `relatedTarget` outside it, and that `endDwell()` in `core/common-behaviors/read-state.ts` then makes `read` emit once the dwell has lasted over 500 ms, which `KbqToastComponent` forwards to the service's `read`
- [ ] 1.4 "Stack position": in `toast-container.component.scss`, verify the stack margin on the anchored sides of every `top-*` and `bottom-*` position and none on `center`, and in `toast-tokens.scss` that the margin comes from `--kbq-size-m`; in `toast.service.ts`, verify that the overlay itself is offset by `indent` only
- [ ] 1.5 "One overlay for the stack": in `toast.service.ts`, verify that `removeTemplate()` calls `detachOverlay()`, which returns while `leaving` still holds a toast, and that the `onDestroy` callback registered in `removeAfterExit()` detaches once that exit ends
- [ ] 1.6 Run `openspec validate correct-toast-baseline --strict` and verify it passes

## Workflow follow-up

- Archive the change with `/opsx:archive`, which merges the corrected requirements into `openspec/specs/toast/spec.md`.
