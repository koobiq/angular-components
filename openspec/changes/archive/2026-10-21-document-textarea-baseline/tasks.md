# Tasks

No source, test or docs file changes in this change. Every task checks the spec against the code. When a check disagrees, correct `specs/textarea/spec.md`, not the code, and move the behaviour to the Findings in `design.md` if it looks like a defect.

## 1. Check the spec against the existing tests

- [ ] 1.1 Run `yarn run styles:build-all`, then `npx vitest run packages/components/textarea`, and verify the textarea unit suite passes on the baseline commit
- [ ] 1.2 Run `npx vitest run packages/components/form-field/trim.spec.ts packages/components/form-field/autofill.spec.ts` and verify both pass. They back the trimming and autofill requirements
- [ ] 1.3 Run `yarn run e2e:docker yarn playwright test packages/components/textarea` and verify the textarea e2e suite passes. It backs the growing, shrinking, row limit and no-scroll-on-focus requirements
- [ ] 1.4 For each requirement in `specs/textarea/spec.md`, name at least one unit or e2e test that asserts it. Verify that every requirement without such a test is listed under "Behaviour without a test" in `design.md`

## 2. Check code-only behaviour in the dev app

`dev:textarea` exists in `package.json`. Run each check in `yarn run dev:textarea` (http://localhost:3003), using the docs examples and the fields embedded there. Read directive state in the browser console with `ng.getDirectives(element)`. Where a check needs a binding the dev app does not have, make a temporary edit to `packages/components-dev/textarea/template.html` and revert it before 3.2.

- [ ] 2.1 Verify in the DOM:
    - each textarea has the classes `kbq-textarea` and `kbq-native-scrollbar`;
    - its form field has `kbq-form-field-type-textarea`;
    - ids are distinct and start with `kbq-textarea-`;
    - each `kbq-label` renders a `<label>` whose `for` matches the id
- [ ] 2.2 Verify in the error state example:
    - the field has `aria-invalid="true"`, the form field has `kbq-form-field_invalid`, and the error is shown;
    - the hint's id is in the textarea's `aria-describedby`;
    - after typing ten characters, `aria-invalid` is `"false"` and no `kbq-error` is rendered
- [ ] 2.3 Verify the free space and the row limit:
    - in the `canGrow` example, one empty line shows below the text, and the dev app's field with `[freeRowsHeight]="0"` shows none;
    - at the row limit the field with `[maxRows]="5"` carries both `kbq-textarea_max-row-limit-reached` and `kbq-textarea-resizable` and shows no resize handle;
    - deleting lines below the limit removes both classes and the field grows and shrinks again
- [ ] 2.4 With a temporary field that has `[canGrow]="false"` and `[maxRows]="2"` and ten lines, verify that `maxRowLimitReached()` returns `false` and the field keeps its resize handle
- [ ] 2.5 Verify the disabled state:
    - toggling the disabled example, which binds `[disabled]` without a form, disables the element and adds `kbq-disabled` to the form field;
    - in a temporary field bound with `[formControl]` and `[disabled]="false"`, calling `disable()` on the control disables the element;
    - disabling a focused textarea makes `focused()` return `false`
- [ ] 2.6 Verify the value:
    - a temporary `[value]` binding is shown in the element and followed when it changes;
    - after `setValue('text', { emitEvent: false })` on a bound control and the next change detection, `value()` returns `text` and `empty()` returns `false`
- [ ] 2.7 Verify the trimming:
    - in the error state example, typing three spaces, `abcdefg` and three spaces keeps the "Minimum 10 characters" error, because the model holds seven characters, while the element still shows the spaces;
    - with `no-trim` added to the textarea, the same input clears the error
- [ ] 2.8 Verify focus:
    - a click on the form field padding outside the textarea focuses it;
    - `focus()` called on the directive focuses the element, and `focused()` follows focus and blur
- [ ] 2.9 In a temporary component that provides `kbqErrorStateMatcherProvider` and also binds `[errorStateMatcher]`, verify that the bound matcher decides the error state
- [ ] 2.10 Run `yarn run docs` or `yarn run docs:build` and verify that the prerendered textarea overview page contains the textarea without an inline `min-height`, and that the build logs no error from it

## 3. Final checks

- [ ] 3.1 Run `openspec validate document-textarea-baseline --strict` and verify it reports the change as valid
- [ ] 3.2 Run `git status --short` and verify that nothing outside `openspec/` has changed

## Workflow follow-up

- Archive with `/opsx:archive document-textarea-baseline` once the checks pass. This creates `openspec/specs/textarea/spec.md`.
- Decide which Findings in `design.md` become changes of their own. The clamp at the row limit, which cuts the last visible line, is the most user-visible one.
