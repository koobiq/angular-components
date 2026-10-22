# Tasks

No source, test or docs file changes in this change. Every task checks the spec against the code. When a check disagrees, correct `specs/modal/spec.md`, not the code, and move the behaviour to the Findings in `design.md` if it looks like a defect.

## 1. Check the spec against the existing tests

- [ ] 1.1 Run `yarn run styles:build-all`, then `npx vitest run packages/components/modal`, and verify the modal unit suites (`modal.spec.ts`, `modal-control.service.spec.ts`) pass on the baseline commit
- [ ] 1.2 Run `yarn run e2e:docker yarn playwright test packages/components/modal` and verify the modal e2e suite passes. It backs the placement and height, scrollbar, overflow shadow, focus trap and inert page requirements
- [ ] 1.3 For each requirement in `specs/modal/spec.md`, name at least one unit or e2e test that asserts it. Verify that every requirement without such a test is listed under "Behaviour without a test" in `design.md`

## 2. Check code-only behaviour in the dev app

Run each check in `yarn run dev:modal` (http://localhost:3003; the script exists in `package.json`), using the docs examples and the declarative dialog embedded there. Where no example sets an option, open a dialog from the browser console through the service of an embedded example, for instance `ng.getComponent(document.querySelector('modal-overview-example')).modalService.create({ … })`.

- [ ] 2.1 Verify the layouts:
    - `confirm()` given `kbqTitle`, `kbqClosable: true` and `kbqFooter` renders no title, no close button and no custom footer, and logs the `kbqFooter` warning;
    - `delete()` and `success()` add `kbq-confirm-warn` and `kbq-confirm-success` and otherwise look like `confirm()`;
    - `kbqContent: '<b>bold</b>'` renders bold text;
    - the footer template of the "Modal template" example replaces the predefined buttons;
    - `kbqOkType` changes the OK color of a confirm dialog only
- [ ] 2.2 Verify the OK and Cancel flows:
    - a `kbqOkClick` returning a promise that resolves to `'done'` after two seconds keeps the OK button in its progress state, then closes the dialog, and `afterClose` emits `'done'`;
    - a synchronous `kbqOkClick` returning `'saved'` closes with `'saved'`;
    - `kbqOkLoading: true` shows the progress state;
    - a footer entry whose `onClick` returns a promise shows its progress state and leaves the dialog open;
    - the "Modal component" example logs the action chosen in the content as the `afterClose` result
- [ ] 2.3 Verify the pointer and the keyboard:
    - in the "Modal with caption" example, a press outside the dialog does not close it;
    - `kbqMaskClosable: true` with `kbqMask: false` does not close on a press outside;
    - Ctrl + Enter in the "Modal with caption" example does nothing;
    - Ctrl + Enter in the "Modal template" example activates Save
- [ ] 2.4 Verify the focus modes:
    - `kbqAutoFocus: 'first-heading'` focuses the title, which gets `tabindex="-1"`;
    - a titled dialog with `kbqOkText` focuses the OK button
- [ ] 2.5 Verify the page and the overlay:
    - an element with `aria-live` appended to `document.body` before opening a dialog does not get `inert`;
    - the body has no inline `overflow` after the last dialog has closed;
    - the host element of a dialog's overlay has `kbq-modal-overlay`;
    - with the declarative dialog open and a subscriber on its `kbqOnCancel`, setting `htmlModalVisible` of `dev-app` to `false` from the console, followed by `ng.applyChanges`, closes the dialog without emitting `kbqOnCancel`
- [ ] 2.6 Verify the width and the style inputs:
    - `kbqWidth: 480` and `kbqWidth: '50%'` set `width: 480px` and `width: 50%` on the dialog element;
    - `kbqStyle`, `kbqBodyStyle` and `kbqWrapClassName` reach the dialog element, the body and the wrapper
- [ ] 2.7 In the docs site (`yarn run docs`), switch the examples language in the navbar to English, open a titled modal example and verify that the close button's `aria-label` is "Close"

## 3. Final checks

- [ ] 3.1 Run `openspec validate document-modal-baseline --strict` and verify it reports the change as valid
- [ ] 3.2 Run `git status --short` and verify that nothing outside `openspec/` has changed

## Workflow follow-up

- Archive with `/opsx:archive document-modal-baseline` once the checks pass. This creates `openspec/specs/modal/spec.md`.
- Decide which Findings in `design.md` become changes of their own. The declarative dialog dropped from the registry after its first close, and the predefined OK button taking focus and missing from Ctrl + Enter, are the most user-visible ones.
