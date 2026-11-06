# Tasks

No source, test or docs file changes in this change. Every task checks the spec against the code. When a check disagrees, correct `specs/toggle/spec.md`, not the code, and move the behaviour to the Findings in `design.md` if it looks like a defect. A temporary edit made in the dev app for a check is reverted before task 3.2.

## 1. Check the spec against the existing tests

- [ ] 1.1 Run `yarn run styles:build-all`, then `npx vitest run packages/components/toggle packages/components/core/common-behaviors/checkable.spec.ts`, and verify that the toggle suite and the shared checkable suite pass on the baseline commit
- [ ] 1.2 Run `yarn run e2e:docker yarn playwright test packages/components/toggle` and verify the toggle e2e suite passes. It backs the color, indeterminate and label position screenshots, the big size, the one-line height, the loading attributes and reduced motion
- [ ] 1.3 For each requirement in `specs/toggle/spec.md`, name at least one unit or e2e test that asserts it through `kbq-toggle`. Verify that every requirement without such a test, or backed only by the test host of `checkable.spec.ts`, is listed under "Behaviour without a test" in `design.md`

## 2. Check code-only behaviour in the dev app

Run each check in `yarn run dev:toggle` (http://localhost:3003); the script exists in `package.json`. The page holds a toggle bound to `toggleControl` with its value printed below it, toggles bound with `ngModel`, and every docs example. Read and set a toggle instance in the browser console with `ng.getComponent(element)`, then call `ng.applyChanges(element)` when a plain field was set.

- [ ] 2.1 Verify pointer and keyboard handling on the `toggleControl` toggle:
    - Space and Enter on the focused toggle switch it, and the printed value follows;
    - a `click` listener added to the host with `addEventListener` sees one event per pointer click and none for Space or Enter;
    - focus by Tab gives the host `cdk-focused` and `cdk-keyboard-focused`; `focus()` called from the console gives `cdk-keyboard-focused` too
- [ ] 2.2 Verify forms integration on the same toggle, with `change` subscribed from the console:
    - a click prints `true`, and the control is dirty and touched before focus leaves;
    - inside the `change` callback, `toggleControl.value` already holds the new value;
    - `toggleControl.setValue('yes')` turns the toggle on without a `change` event;
    - setting `checked` to `false` on the instance leaves the printed value unchanged;
    - after `toggleControl.setErrors({ invalid: true })` and `markAsTouched()`, the toggle has no `kbq-error` and its checkbox no `aria-invalid`
- [ ] 2.3 Verify the disabled and loading states:
    - after "Set Disabled", the checkbox of a disabled toggle has `aria-disabled="true"` and `tabindex="-1"`;
    - in the loading example, while the toggle is loading, Space and Enter do not switch it and emit no `change`
- [ ] 2.4 Verify the indeterminate behaviour in the indeterminate example, with `change` and `indeterminateChange` subscribed:
    - setting `indeterminate` to `false` and then `true` in code emits `false` and then `true`, and setting `true` again emits nothing;
    - a click emits `change` before `indeterminateChange` emits `false`;
    - with `clickAction` set to `check`, a click on an indeterminate toggle flips `checked` and keeps `indeterminate`;
    - `getAriaChecked()` returns the `aria-checked` value of the checkbox in each state
- [ ] 2.5 Verify the attributes, with temporary edits to `packages/components-dev/toggle/template.html`:
    - a toggle without a hint has an `aria-describedby` that names an existing, empty container;
    - `value="on"` appears on the native checkbox;
    - `[tabIndex]="'abc'"` gives the checkbox `tabindex="0"`;
    - a bare `big` attribute does not add `kbq-toggle_big`, or is rejected by the template type check;
    - `#t="kbqToggle"` gives the toggle instance;
    - record whether static `tabIndex="3"` and `aria-label="Name"` also stay on the host; this decides suspected defect 1 in `design.md`
- [ ] 2.6 Verify that with `{ provide: ANIMATION_MODULE_TYPE, useValue: 'NoopAnimations' }` added temporarily to the providers in `packages/components-dev/toggle/main.ts`, the bar, the knob and the dash of every switch have `kbq-animations-disabled`

## 3. Final checks

- [ ] 3.1 Run `openspec validate document-toggle-baseline --strict` and verify it reports the change as valid
- [ ] 3.2 Run `git status --short` and verify that nothing outside `openspec/` has changed, temporary dev app edits included

## Workflow follow-up

- Archive with `/opsx:archive document-toggle-baseline` once the checks pass. This creates `openspec/specs/toggle/spec.md`.
- Decide which Findings in `design.md` become changes of their own. The examples without an accessible name and the static attributes left on the host are the most user-visible ones.
