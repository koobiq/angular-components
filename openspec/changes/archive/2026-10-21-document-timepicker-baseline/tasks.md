# Tasks

No source, test or docs file changes in this change. Every task checks the spec against the code. When a check disagrees, correct `specs/timepicker/spec.md`, not the code, and move the behaviour to the Findings in `design.md` if it looks like a defect.

## 1. Check the spec against the existing tests

- [ ] 1.1 Run `yarn run styles:build-all`, then `npx vitest run packages/components/timepicker`, and verify the timepicker unit suite passes on the baseline commit
- [ ] 1.2 Run `yarn run e2e:docker yarn playwright test packages/components/timepicker` and verify the timepicker e2e suite passes. It backs the screenshots of the states and the "Digits typed repeatedly in front" scenario
- [ ] 1.3 For each requirement in `specs/timepicker/spec.md`, name at least one unit or e2e test that asserts it, counting the timepicker tests in `packages/components/inline-edit/inline-edit.spec.ts`. Verify that every requirement without such a test is listed under "Behaviour without a test" in `design.md`

## 2. Check code-only behaviour in the dev app

`dev:timepicker` exists in `package.json`. Run each check in `yarn run dev:timepicker` (http://localhost:3003), in the timepicker bound to `ngModel` with `min` and `max` and in the embedded validation example. The dev app has no validation tooltip and no time zone switch: the tooltip is checked in 2.6 and the time zone in 3.1.

- [ ] 2.1 Verify in the DOM:
    - the input has the classes `kbq-input` and `kbq-timepicker`, `autocomplete="off"` and an `id` starting with `kbq-timepicker-`;
    - `size` is 5 and becomes 8 after switching the format radio to `hh:mm:ss`;
    - the enclosing form field has the class `kbq-form-field-type-timepicker`;
    - a click on the form field's container outside the input focuses the input
- [ ] 2.2 Verify the rejected keys:
    - a letter key inserts nothing;
    - `:` typed after two complete hour digits inserts nothing;
    - `5` followed by `.` in an empty field gives `05:00`
- [ ] 2.3 Verify the part selection, in both formats and with a value:
    - Right moves through the parts and wraps from the last to the hours, Left wraps the other way;
    - Home and Page Up select the hours, End and Page Down select the last part;
    - Space with a selection moves to the next part and never inserts a space;
    - with the field cleared, Left and Right move the caret natively
- [ ] 2.4 Verify typing, pasting and blur against the "value" line of the dev app:
    - clearing the text with Backspace leaves the value unchanged until the input loses focus, then the value is `null`;
    - pasting `25:61` shows `23:59`, and pasting `07:15 pm` gives 19:15;
    - in `hh:mm` format with a value whose seconds are not zero, pasting `10:10:10` keeps the old seconds
- [ ] 2.5 Verify that the bounds compare dates: type 7 January 2020 into the datepicker input that shares the model of the `ngModel` timepicker (bounds 12:00:10 to 13:00:10 on 6 January 2020) and verify that the timepicker input becomes `ng-invalid` although its time is inside the bounds. If the datepicker does not pass an out-of-range date to the model, verify the `compareDateTime` call in the source instead and note it in 3.1
- [ ] 2.6 Run `yarn run docs` and, on the timepicker overview page, verify on the first example that a letter key shows the "Только цифры" tooltip, which hides about 3 seconds later and is not extended by further letters

## 3. Check what neither the tests nor the dev app reach

- [ ] 3.1 Verify by reading `timepicker.directive.ts` and record the outcome in `design.md` if it differs:
    - the constructor throws the `No provider found for DateAdapter` error;
    - a bound `placeholder` wins over the localized pattern, and an empty localized string falls back to the exported placeholder map;
    - `[localeOverrides]` reaches the placeholder through `KbqLocaleOverridesDirective`;
    - `KbqDateTimezoneService.changes` re-renders the value without calling the form's change callback;
    - `setDisabledState` drives `disabled()` and the `disabled` attribute, and a disabled timepicker stops reporting focus;
    - gaining focus calls the form's touched callback

## 4. Final checks

- [ ] 4.1 Run `openspec validate document-timepicker-baseline --strict` and verify it reports the change as valid
- [ ] 4.2 Run `git status --short` and verify that nothing outside `openspec/` has changed

## Workflow follow-up

- Archive with `/opsx:archive document-timepicker-baseline` once the checks pass. This creates `openspec/specs/timepicker/spec.md`.
- Decide which Findings in `design.md` become changes of their own. The hidden milliseconds that make the exact `max` fail and the next-day shift of pasted 12-hour times are the most user-visible ones.
