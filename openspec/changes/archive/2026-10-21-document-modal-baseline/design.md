# Design

## Context

See proposal.md for why. The spec describes `main` at `c9c196a9b`. Its sources are:

- `packages/components/modal/`: the component and its template, the service, the ref, the composition directives, the `toCssUnit` pipe, the modal control service, the styles where they define layout and motion, `modal.spec.ts`, `modal-control.service.spec.ts`, `e2e.ts` and `e2e.playwright-spec.ts`;
- the docs pages `modal.{en,ru}.mdx` and `examples.modal.{en,ru}.mdx`, and the nine examples under `packages/docs-examples/components/modal/`;
- the API golden file `tools/public_api_guard/components/modal.api.md`;
- what the modal takes from `packages/components/core`: `kbqAnimationsDisabled`, the a11y locale and `KbqLocaleOverridesDirective`.

Every claim in the spec was checked against the source, not taken from docs or test names. `openspec/specs/` holds only the select baseline, whose archived change set the pattern this one follows.

## Goals / Non-Goals

**Goals:**

- A contract a consumer can rely on: every requirement is observable from outside the dialog, and every scenario can be checked by an existing test or by hand in the dev app.
- One place to diff against when modal behaviour changes later.

**Non-Goals:**

- Fixing anything found along the way (see Findings).
- Internals: the modal control service, the service's builder, `KBQ_MODAL_OPTIONS`, the `@docs-private` members of the component, timers and change-detection details, CSS structure and design tokens beyond the documented sizes.
- `kbq-sidepanel`, `kbq-popover`, other components and deprecated APIs.
- Changes to tests, docs or examples.

## Decisions

The general decisions of the select baseline apply unchanged: the spec is in English, it describes what ships with its quirks, only behaviour confirmed by a test or read in the source goes in, and the contract is public names, selectors, host classes, ARIA attributes, thrown errors and warnings, and exported constants. Only the modal-specific decisions follow.

1. **One capability, `modal`, at a flat path.** It covers `kbq-modal`, `KbqModalService`, `KbqModalRef`, the composition directives and the `toCssUnit` pipe. Splitting the service from the component was considered and rejected: the service only turns options into the inputs of the same component, so every flow — OK, Cancel, Escape, focus, stacking — would have to be stated twice.
2. **Both entry paths in one set of requirements.** The service and a declarative `<kbq-modal [(kbqVisible)]>` share the open and close flow. A requirement says which path it applies to only where they differ: teardown, `KBQ_MODAL_DATA`, the container, the initial visibility and the `[(kbqVisible)]` binding.
3. **No animation timings in the contract.** The 300 ms duration is `MODAL_ANIMATE_DURATION`, which is `@internal`. Requirements say "once the opening animation has ended" instead. The 48 px viewport inset and the 400, 640 and 960 px presets are stated, because the docs page publishes them.
4. **The registry through the service only.** `KbqModalControlService` is not exported from the entry point, so the spec describes the registry through `KbqModalService.openModals`, `closeAll()` and `afterAllClose`. Its stacking behaviour is described by what it does to the dialogs: one dim layer, `inert` on covered dialogs and on the page.
5. **Quirks kept in the spec.** Examples:
    - the value a handler returns becomes the close result;
    - `kbqMaskClosable` does nothing without `kbqMask`;
    - Ctrl + Enter does not reach the predefined OK button of the default layout, and Cmd + Enter does nothing;
    - the predefined OK button always carries `autofocus`, so it takes the initial focus whatever `kbqAutoFocus` says, `false` aside;
    - the confirm layout ignores `kbqTitle`, `kbqCaption`, `kbqClosable` and `kbqFooter`;
    - `kbqOkType` colors the OK button of the confirm layout only;
    - setting `kbqVisible` to `false` through the binding closes the dialog without the Cancel flow.

    Each of them can change later through a `MODIFIED` delta. Behaviour that looks broken rather than merely surprising — a rejected promise closing the dialog, a declarative dialog dropped from the registry — stays out of the spec and is listed under Findings.

## Risks / Trade-offs

- [The spec drifts from the code] → A change to `packages/components/modal` updates `openspec/specs/modal/spec.md` with a delta. Reviewers check it the same way they check the API golden file.
- [Some requirements rest on the source rather than on a test] → tasks.md checks each of them by hand in `yarn run dev:modal` before archiving, opening dialogs from the browser console where no example sets the option. A mismatch is corrected in the delta, not in the code.
- [A quirk in the spec reads as intended behaviour] → The quirks that disagree with the docs are also listed under Findings, so the change that fixes one knows it is replacing a requirement.
- [The spec is long: 52 requirements, 85 scenarios] → It is grouped in the order of the docs page: opening and events, layouts and content, the OK and Cancel flows, the dim layer and stacking, size and scrolling, focus, accessibility, and the service's container and overlay.

## Findings

These are recorded, not fixed, in this change. Each can become a change of its own.

**Docs and JSDoc that disagree with the code**

1. The keyboard table of `modal.{en,ru}.mdx` says Ctrl + Enter "performs the primary dialog action". It clicks only an element marked `kbq-modal-main-action`, plus the OK flow of the confirm layout. The predefined OK button of the default layout carries no marker, so a default dialog with `kbqOkText` ignores the shortcut. Cmd + Enter does nothing on macOS.
2. The predefined OK button always carries `autofocus`, which beats every `kbqAutoFocus` value but `false`. With `kbqOkText` set, the OK button gets the initial focus. That contradicts:
    - the docs line that the first tabbable control "for a dialog with a header" is the close button;
    - the advice to set `kbqAutoFocus: 'dialog'` for a long scrolling dialog;
    - the JSDoc of `KbqModalAutoFocus` for `'first-tabbable'`.
3. The JSDoc of `delete()` says it opens a dialog "styled for a destructive action". Nothing styles `kbq-confirm-warn`, so `delete()`, `success()` and `confirm()` render the same. `kbqOkType` is a `KbqButtonColor`, which has no error color.
4. The JSDoc of `kbqOkType` says it colors "the predefined OK button". The default layout always renders that button in the contrast color; only the confirm layout reads `kbqOkType`.
5. In `IModalButtonOptions`:
    - the comment on `autoLoading` says it controls the automatic progress state. The progress state is shown for any promise returned by `onClick`, whatever `autoLoading` says;
    - `shape`, `ghost` and `size` are never rendered.
6. The JSDoc of `ModalOptions.kbqVisible` says the service manages it. Passing it to the service breaks the open flow (suspected defect 4).
7. The JSDoc of `create()` says that destroying the opener "closes" the dialog. A comment in the service also claims that `afterClose` then emits. In fact the dialog is torn down without `beforeClose` or `afterClose` and without restoring focus.
8. The JSDoc of `kbqContent` says it "falls back to `<ng-content>`". In the custom layout neither string or template content nor projected content is rendered.
9. The docs say the dialog closes "on a left mouse button click". It reacts as soon as the button is pressed on the area around the dialog, not to the click.
10. The Position section says opening a dialog must not shift the page sideways. The scroll lock sets `overflow: hidden` on the body and does not make up for the width of a classic scrollbar.
11. The examples page says a `kbqComponent` is created from the root environment injector. It is created from the injector of the `KbqModalService` instance. `KbqModalModule` still lists `KbqModalService` in its providers, so a lazily loaded module that imports it gets an instance of its own.
12. The JSDoc of `kbqComponent` calls it "the instance of component"; it takes a component class.

**Suspected defects (from reading the code, not reproduced)**

1. A declarative dialog is registered once, on init, and unregistered when it first finishes closing. On every later opening it is missing from `openModals`, `closeAll()` does not close it, and `afterAllClose` ignores it.
2. The dim-layer hand-over runs only when a dialog registers while it is already shown, which is the service path. A declarative dialog opened over another shown dialog after its own init keeps both dim layers, against the docs' "only one dim overlay should remain".
3. `closeAll()` closes only the dialogs in `openModals`, so a dialog still in its opening animation stays open.
4. `kbqVisible: true` passed to the service turns the service's `open()` call into a no-op. The dialog is painted and focused, but:
    - `afterOpen` never emits and the dialog never enters `openModals`;
    - the body is not locked and the page is not made inert;
    - it never counts as the topmost dialog, so over another shown dialog it is made `inert` itself.
5. A promise from `kbqOkClick` or `kbqCancelClick` that rejects closes the dialog, with the rejection reason as the close result.
6. A dialog closed during its opening animation still settles the opening: `afterOpen` emits after `beforeClose`, the dialog enters `openModals` until it finishes closing, and the closing animation is cut short.
7. The progress state of an array footer button is cleared on a plain object once the promise settles, with nothing marking the dialog for check. Under the zoneless, `OnPush` setup the spinner can stay until something else checks the dialog.
8. `confirm()` and `open()` write `kbqModalType` and `kbqClassName` into the options object the caller passed. Reusing one object for two `confirm()` calls repeats the `kbq-confirm` classes.
9. The scroll lock removes the body's inline `overflow` when the last dialog closes, instead of restoring a value the page had set before.
10. `triggerOk()`, `triggerCancel()` and the predefined buttons run the handler, or emit `kbqOnOk` and `kbqOnCancel`, even when the dialog is already closed or closing. Only the close button, Escape and the dim layer check that the dialog is shown.
11. A composed title, caption or footer registers itself for good. If it is rendered conditionally and removed, `aria-labelledby` or `aria-describedby` points at a missing id, and the dialog still counts as having a footer.

**Tests whose name and body disagree, or that cannot fail**

- "should process kbqPreventFocusRestoring flag set to true" and "… set to false": there is no such option. The tests set `kbqRestoreFocus`, and the one named "true" passes `false`.
- "should set focus inside modal when opened by dropdown" calls `showConfirm()` directly and never activates the dropdown item. The dropdown items are only counted.
- "should close on Escape and emit kbqOnCancel first" checks the count and the visibility, not the order.
- "should return/receive with/without result data" covers only the case without a result.
- "should trigger kbqOkClick/kbqCancelClick" calls `triggerCancel()` on a dialog `triggerOk()` has already closed. It passes only because of suspected defect 10.
- "should modal not be registered twice" reaches the private registry through `as any`.
- "should close all opened modals (include non-service modals)" and "should show only one mask at a time" use a declarative dialog that is shown from its first render, the one case where suspected defects 1 and 2 do not apply.

**Behaviour without a test.** The spec states these from the source:

- `beforeClose` and `kbqBeforeClose`;
- closing through the `[(kbqVisible)]` binding without the Cancel flow, the initial visibility of a declarative dialog, and `kbqGetContainer`;
- the classes added by `confirm()`, `success()` and `delete()`;
- in the confirm layout: ignoring `kbqTitle`, `kbqCaption`, `kbqClosable` and `kbqFooter`, the development-mode warning, and `kbqOkType`;
- what the custom layout leaves out;
- strings rendered as sanitized HTML, template title, caption and footer, and a footer template replacing the predefined buttons;
- `kbqComponent` winning over a component in `kbqContent`, `getContentComponent()`, and `KbqModalRef` injected into the content (only the docs examples use it);
- the asynchronous handler: its progress state and its resolved value as the close result. Also the returned value of a synchronous handler as the close result, `kbqOkLoading` and `kbqCancelLoading`, and the progress state of a footer button whose `onClick` returns a promise;
- `kbqMaskClosable` defaulting to `false` and needing `kbqMask`, `kbqMask: false` and `kbqMaskStyle`;
- Ctrl + Enter doing nothing in a default dialog that has only the predefined buttons;
- live regions left reachable while the page is inert, and the scroll lock released after a normal close;
- `kbqWidth`, `toCssUnit`, `kbqStyle`, `kbqBodyStyle` and `kbqWrapClassName` (the last only as a query selector);
- `kbqAutoFocus: 'first-heading'`;
- switching the locale and `[localeOverrides]`;
- the `kbq-modal-overlay` class and the teardown on router navigation;
- a dialog still opening being absent from `openModals`;
- the `kbqModalTitleActions` slot.
