# Tasks

No source, test or docs file changes in this change. Every task checks the spec against the code. When a check disagrees, correct `specs/form-field/spec.md`, not the code, and move the behaviour to the Findings in `design.md` if it looks like a defect.

## 1. Check the spec against the existing tests

- [ ] 1.1 Run `yarn run styles:build-all`, then `npx vitest run packages/components/form-field`, and verify the form-field unit suites (`form-field`, `autofill`, `fieldset`, `trim`) pass on the baseline commit
- [ ] 1.2 Run `npx vitest run packages/components/input packages/components/inline-edit` and verify they pass. They back the control type class, the stepper, the cleaner's number-input error, Alt+F8, the disabled password toggle and the overlay origin
- [ ] 1.3 Run `yarn run e2e:docker yarn playwright test packages/components/form-field` and verify the form-field e2e suite passes. It backs the cleaner's Escape and Space, Alt+F8, the stepper added later and the autofill class
- [ ] 1.4 For each requirement in `specs/form-field/spec.md`, name at least one unit or e2e test that asserts it. Verify that every requirement without such a test is listed under "Behaviour without a test" in `design.md`

## 2. Check code-only behaviour by hand

`package.json` has both `dev:form-field` and `dev:input`. Run each check in `yarn run dev:form-field` (http://localhost:3003) unless it names `yarn run dev:input`, which adds a "make all controls disabled" toggle, locale buttons and password tooltips.

- [ ] 2.1 Verify the control slot in `dev:form-field`:
    - a click on the search icon of the prefix-and-suffix example focuses its input;
    - tabbing into a field gives its host `cdk-focused` and `cdk-keyboard-focused`;
    - the label of the overview example is a `<label>` whose id is the input's id followed by `-label`;
    - a field without hints has no `.kbq-form-field__hint`, and a field without prefixes has no `.kbq-form-field__prefix`;
    - every form field host has the class `kbq-empty`
- [ ] 2.2 Verify `aria-describedby` in `dev:form-field`: add `aria-describedby="extra"` to the input of the error example in the devtools, then focus it and leave it empty. Its `aria-describedby` starts with `extra`, followed by the error id and the hint id
- [ ] 2.3 Verify the cleaner in `dev:input`, field "With clear-button":
    - turning on "make all controls disabled" removes the cleaner from a filled field;
    - Escape in the empty, focused field changes nothing;
    - after "set en-US", the cleaner's `aria-label` is "Clear"
- [ ] 2.4 Verify the password toggle in `dev:input`:
    - hovering the toggle shows "Показать пароль", and after revealing the password, "Скрыть пароль";
    - with all controls disabled, selecting a toggle in the devtools and running `ng.getComponent($0).toggle(new Event('click'))` in the console leaves the input's `type` unchanged;
    - after "set en-US", the button is named "Show password";
    - touching and leaving the empty required field "Without password hints" gives the eye icon the class `kbq-error`
- [ ] 2.5 Verify the stepper in `dev:form-field`, number field with `kbq-stepper`:
    - pressing an arrow while the input has focus keeps focus in the input;
    - both arrows have `aria-hidden="true"` and `tabindex="-1"`, and Tab never stops on them
- [ ] 2.6 Verify trimming in `dev:form-field`: typing " ab " into the hint example makes its counter show 2 characters, so trimming applies through `KbqInputModule`
- [ ] 2.7 Verify the overlay origin in `dev:form-field`: the panel of a select opens aligned with the edges of its field's `.kbq-form-field__container`, not with the label
- [ ] 2.8 Verify by reading the source the behaviour no dev app can show, and correct the spec where the source disagrees:
    - `password-toggle.ts` and `stepper.ts` throw their missing-control errors when first rendered;
    - the toggle's icon button is the fallback content of its `<ng-content>`;
    - `KbqTrim` reads `no-trim` as a static host attribute;
    - `KbqFormField` calls `setDescribedByIds` when the control has it, and `inOverlay` is a `model()`;
    - a `noBorders` binding takes precedence over `KBQ_FORM_FIELD_DEFAULT_OPTIONS`

## 3. Final checks

- [ ] 3.1 Run `openspec validate document-form-field-baseline --strict` and verify it reports the change as valid
- [ ] 3.2 Run `git status --short` and verify that nothing outside `openspec/` has changed

## Workflow follow-up

- Archive with `/opsx:archive document-form-field-baseline` once the checks pass. This creates `openspec/specs/form-field/spec.md`.
- Decide which Findings in `design.md` become changes of their own. The Escape handler of the cleaner, which clears the field and keeps the key from an open autocomplete panel or a modal, and the cleaner that does nothing without a form directive are the most user-visible ones.
