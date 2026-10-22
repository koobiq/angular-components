# Tasks

No source, test or docs file changes in this change. Every task checks the spec against the code. When a check disagrees, correct `specs/input/spec.md`, not the code, and move the behaviour to the Findings in `design.md` if it looks like a defect.

## 1. Check the spec against the existing tests

- [ ] 1.1 Run `yarn run styles:build-all`, then `npx vitest run packages/components/input`, and verify the four input unit suites pass on the baseline commit, the paste snapshot included
- [ ] 1.2 Run `npx vitest run packages/components/form-field/autofill.spec.ts` and verify it passes. It backs the autofill requirement
- [ ] 1.3 Run `yarn run e2e:docker yarn playwright test packages/components/input` and verify the input e2e suite passes. It backs the grouping, caret, keyboard stepping and spinbutton requirements and the screenshots of the text, number and password states
- [ ] 1.4 For each requirement in `specs/input/spec.md`, name at least one unit or e2e test that asserts it. Verify that every requirement without such a test is listed under "Behaviour without a test" in `design.md`

## 2. Check code-only behaviour in the dev app

`yarn run dev:input` exists in `package.json` and serves `packages/components-dev/input` on http://localhost:3003, with locale buttons, a "Number Value" readout, number fields bound to one model (`min` -5, `max` 7, `step` 0.5, and an integer field), password, invalid, cleaner and prefix fields, and the docs examples. Read attributes and properties in DevTools; `ng.getDirectives(element)` gives the directive instances.

- [ ] 2.1 Verify on a text field:
    - a click on the magnifying-glass prefix focuses the input;
    - the "Invalid" input has `required === true` on the element;
    - after `value.set('code')` on its `kbqInput` instance and `ng.applyChanges(element)`, the field shows `code` while its `NgModel` still holds the previous value;
    - calling `control.enable()` on the `NgModel` of the "With placeholder, hint and disabled" field and `ng.applyChanges(element)` removes the element's `disabled` attribute although `disabled` is bound to `true`
- [ ] 2.2 Verify the keys of the "With thousand separators" field in `ru-RU`:
    - `a` and Shift+4 type nothing;
    - after `123`, a `.` shows as `123,`;
    - with the text selected, typing `-` leaves `-` in the field while "Number Value" keeps the previous number;
    - typing `5-` empties the field and "Number Value" becomes empty
- [ ] 2.3 Verify the number values and their bounds:
    - typing `20` with `max` 7 sets "Number Value" to 20, and an Up arrow then gives 7;
    - pressing a stepper arrow while the field has no focus moves focus to the field;
    - while the field is empty it has no `aria-valuenow` and no `aria-valuetext`;
    - after typing in the first number field, the form fields of the other two keep `ng-pristine`
- [ ] 2.4 Verify integer mode and paste:
    - in the integer field `,` and Space type nothing, and a value `1,5` typed in the first field shows as `1,5` there too;
    - pasting `3` into the first field while it shows `12` leaves `3`
- [ ] 2.5 Verify in the embedded `input-number-overview` example that typing `-12000` stays without a separator while `12000` shows `12 000` with a thin space
- [ ] 2.6 Verify the locale buttons: `pt-BR` renders `12345,5` as `12.345,5`, `es-LA` and `tk-TM` render it with a thin space and `,`, and the number value does not change
- [ ] 2.7 Verify on the number field that `disabledChange`, subscribed from the console, emits `true` when "make all controls disabled" is turned on
- [ ] 2.8 Verify on the password fields that the element has the `kbq-input-password` class and `type="password"`, and that the form field has `kbq-form-field-type-input-password`, while a text field's form field has `kbq-form-field-type-input`
- [ ] 2.9 With a temporary edit of `packages/components-dev/input/template.html`, reverted before 3.2, verify:
    - `<input kbqInput type="file">` throws `Input type "file" isn't supported by kbqInput.`;
    - `<input kbqInput type="date">` with a `kbq-cleaner` keeps the cleaner shown while empty;
    - an `<input kbqInput required>` without a form control keeps `aria-invalid="false"` after a blur;
    - a `type="text"` attribute on `kbqInputPassword` is replaced by `password`;
    - toggling `withThousandSeparator` and `startFormattingFrom` leaves the shown text as it is until the next keystroke;
    - `kbqInputLocaleConfigurationProvider({ number: { fractionSeparator: '.' } })`, and `[localeOverrides]` with the same section on one field, render `1234.5` as `1234.5` in `ru-RU`

## 3. Final checks

- [ ] 3.1 Run `openspec validate document-input-baseline --strict` and verify it reports the change as valid
- [ ] 3.2 Run `git status --short` and verify that nothing outside `openspec/` has changed

## Workflow follow-up

- Archive with `/opsx:archive document-input-baseline` once the checks pass. This creates `openspec/specs/input/spec.md`.
- Decide which Findings in `design.md` become changes of their own. The ungrouped negative values and the paste parser that ignores the field's own separators are the most user-visible ones.
- Reconcile the wording shared with `document-form-field-baseline` (cleaner error, stepper, `aria-describedby`, autofill class) when the second of the two is archived.
