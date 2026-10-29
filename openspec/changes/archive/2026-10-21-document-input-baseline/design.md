# Design

## Context

See proposal.md for why. The spec describes `main` at `c9c196a9b`. Its sources are:

- `packages/components/input/`: `input.ts`, `input-number.ts`, `input-password.ts`, `input-number-validators.ts`, `input-errors.ts`, `input-value-accessor.ts`, `input.module.ts`, the four unit specs and the vitest snapshot, `e2e.ts` and `e2e.playwright-spec.ts`, and the `input.{en,ru}.mdx` and `examples.input.{en,ru}.mdx` pages;
- the docs examples under `packages/docs-examples/components/input/`;
- the API golden file `tools/public_api_guard/components/input.api.md`;
- the pieces of `core` the input relies on: the error state tracker and matchers, `kbqInjectAutofilled`, the keycode helpers, the number formatter, `normalizeNumber` and `checkAndNormalizeLocalizedNumber`, the locale overrides directive and the `input.number` locale data;
- the parts of `form-field` that read the input: the control type class, `aria-describedby`, the cleaner, the stepper and the password toggle, and `form-field/autofill.spec.ts`.

Every claim was checked against the source. The general approach follows the archived select baseline (`openspec/changes/archive/2026-10-21-document-select-baseline/`); only what differs for the input is recorded here.

## Goals / Non-Goals

**Goals:**

- A contract a consumer can rely on: every requirement is observable from outside the directives, and every scenario can be checked by an existing test or by hand in the dev app.
- One place to diff against when input behaviour changes later.

**Non-Goals:**

- Fixing anything found along the way (see Findings).
- The form field and its parts (`kbq-stepper` timing, `kbq-password-toggle` and its Alt+F8 shortcut, `kbq-cleaner`, the hints, `kbqTrim`), `kbqNormalizeWhitespace` and `PasswordValidators`. They appear only where they observe the input.
- Deprecated APIs (`KBQ_INPUT_NUMBER_DEFAULT_CONFIGURATION`), styling and design tokens, and internals such as the deferred reformat timer or the caret correction microtask.
- Changes to tests, docs or examples.

## Decisions

The decisions of the select baseline apply: one capability at a flat path, English, what ships quirks included, only confirmed behaviour, and the same notion of what counts as contract. These are specific to the input:

1. **One capability for the whole entry point.** `kbqInput`, `kbqNumberInput`, `kbqInputPassword`, `kbqInputMonospace` and the validators share one entry point, one module and the form field control contract, and `kbqNumberInput` always runs together with `kbqInput` on the same element. A separate `input-number` capability was considered and rejected: a change to the value or disabled handling would then need two deltas. The number input's requirements are grouped after the shared ones, in the order of the docs page.
2. **Deterministic quirks are in the spec; conditional ones are not.** Behaviour the code produces the same way every time is stated as it ships, even where it looks wrong:
    - a negative value is never grouped while a `startFormattingFrom` threshold applies;
    - a paste replaces the whole text of the field;
    - a lone `-` keeps the previous value in the form;
    - typed values outside `min` and `max` are kept;
    - a value set in code on `kbqInput` does not reach the form control.

    The ones that look like defects are also listed under Findings with the requirement a fix would modify. Behaviour that depends on conditions this change could not reproduce — keyboard layouts, browser shortcuts, typing faster than the reformat — stays out of the spec and is listed under Findings only.

3. **Locale-dependent examples use `ru-RU`.** It is the default locale and the one the tests use. Scenarios name the thin space (U+2009) in words rather than embedding the invisible character, so the text survives copying and formatting.
4. **What counts as contract here:**
    - the selectors and the `exportAs` names;
    - the host classes `kbq-input`, `kbq-input-password` and `kbq-input_monospace`, and the form field classes derived from the control type;
    - the ARIA attributes, `inputmode` and the element's `type`;
    - `value`, `valueAsNumber`, `valueChange`, `disabledChange`, `toggleType()` and `elementType`;
    - the `KBQ_INPUT_VALUE_ACCESSOR` and locale tokens and `kbqInputLocaleConfigurationProvider`;
    - the defaults `BIG_STEP` and `SMALL_STEP`;
    - the thrown error and warning messages.

    `value`, `empty`, `focused` and `autofilled` are marked `@docs-private`, but the form field and consumer code read them, so the spec states what they report. The helpers `add`, `getPrecision` and `isFloat` are covered only through the stepping they serve.

## Risks / Trade-offs

- [The spec drifts from the code] → A change to `packages/components/input` updates `openspec/specs/input/spec.md` with a delta. Reviewers check it the same way they check the API golden file.
- [Some requirements rest on the source rather than on a test] → tasks.md checks each of them by hand in `yarn run dev:input` before archiving. A mismatch is corrected in the delta, not in the code.
- [A deterministic quirk is recorded as intended behaviour] → Each such quirk that looks like a defect is listed under Findings next to its requirement, so the fix is a `MODIFIED` delta rather than a surprise.
- [Overlap with the form field baseline] → The cleaner error, the stepper, `aria-describedby` and the autofill class are stated here only as they concern the input. `document-form-field-baseline` is being written at the same time; whichever is archived second reconciles the wording.
- [The spec is long: 60 requirements, 90 scenarios] → It follows the docs page: the shared text input contract, the number input, the validators, number formatting by locale, monospace, password.

## Findings

These are recorded, not fixed, in this change. Each can become a change of its own.

**Docs and JSDoc that disagree with the code**

1. The first sentence of `input.en.mdx` and `input.ru.mdx` lists masking among what Input provides. The entry point has no masking; the example relies on Maskito.
2. "Numeric input field" says `kbqNormalizeWhitespace` replaces thin spaces when pasting. The directive in `core` acts on copy: it puts the field's whole value on the clipboard with thin spaces turned into spaces, whatever part of it was selected.
3. The `integer` bullet says it rejects the fraction separator on typing. It also rejects the group separator keys, Space in `ru-RU` included.
4. "Number formatting and locale" says the separators come from the `input.number` section. The fraction separator does, but the rendered group separator comes from `Intl.NumberFormat` for the active locale id unless the section sets `viewGroupSeparator`. Paste ignores the section altogether (see the suspected defects).
5. Neither page mentions `[localeOverrides]` on the number input, `[value]` or `valueAsNumber`.
6. The error thrown for a `kbq-cleaner` next to a number input speaks of `type="number"`. The number input always renders `type="text"`, and the docs tell consumers not to use `type="number"`.
7. The `input-number-overview` example starts its `ngModel` values at `''`. The number input formats an empty string as `0`, so the four fields probably start with `0` and `aria-valuenow=""` while the model holds a string (not reproduced).
8. The hint of the first field in that example reads "От −12 000 до 12 000". The field never renders `-12000` with a group separator (see suspected defect 1).
9. The JSDoc of `KbqMinValidator` and `KbqMaxValidator` says they install themselves; they install `Validators.min` and `Validators.max`.
10. The comment over the playground block in `e2e.ts` says typing, stepping, pasting and locale switching are asserted there. The Playwright spec has no paste or locale case.

**Suspected defects (from reading the code, not reproduced)**

1. With a `startFormattingFrom` threshold — `ru-RU` sets one by default — the grouping test compares the signed integer part, so negative values are never grouped (requirement "Grouping threshold").
2. The keyboard filter works on `keyCode` and blocks Shift with any digit. On layouts that type digits with Shift, such as the French one, the main-row digits cannot be typed. It also blocks every Ctrl or Cmd shortcut other than A, C, V, X and Z while the field has focus, such as Ctrl+Y, Ctrl+F or Cmd+R, as well as Page Up and Page Down.
3. A minus is let through wherever the caret is. Typed after digits, it makes the text unparseable, which empties the field and sets the value to `null`. Typing the fraction separator into an empty field does the same.
4. A paste replaces the whole text, whatever the caret position or selection, so pasting `3` after `12` leaves `3` (requirement "Paste").
5. Paste parsing reads the shipped data of the active locale id. It ignores `kbqInputLocaleConfigurationProvider`, `[localeOverrides]` and locales registered by the application. Without `KBQ_LOCALE_SERVICE` it tries `en-US` first, so pasting `1,5` into the default `ru-RU`-formatted field gives `15`.
6. Overriding `groupSeparator` without `viewGroupSeparator` changes what is parsed but not what is rendered. With `{ groupSeparator: ['.'], fractionSeparator: ',' }` in `en-US`, `1234.5` renders as `1,234,5`, which the next keystroke cannot parse.
7. A step at a bound reports the unchanged value again: `valueChange` emits and the form control is marked dirty.
8. A keystroke typed before the previous reformat has settled is inserted at the uncorrected caret. The e2e spec records this as INP-BUG-06: typing `1234567` at once can render `1 234 675`. An arrow key pressed in that window steps from the last committed value.
9. `integer` does not stop a fractional value from a form write or from a fractional `step` (requirement "Integer mode").
10. On `kbqInput`, `[value]` and `value.set()` write the element without going through the forms API, so the view and a bound form control can disagree (requirement "Value written to the element").

**Tests whose name and body disagree, or that cannot fail**

- `input-number.spec.ts` "should throw an exception with kbq-cleaner" looks for a cleaner in a fixture that has none and expects `null`.
- "should have stepper on focus" asserts that the stepper and its two icons exist; they exist without the focus event.
- "should be able to set step" steps down twice from an empty field with `min="3"`. Both results clamp to `3`, so the step size is never observed.
- "should step up when max is set" gets `3` and `3.5` from the `min` clamp; `max` is never reached.
- "should step up/down with bug step on shift and up/down arrow key" means "big step".
- "should allow entering minus" starts from `null` and asserts `null`. It passes whether or not the model is updated, and it does not check that the `-` stays in the field.
- In `input.spec.ts`, two cases cannot fail: "should not be in error state when invalid and touched but form not submitted" (`ShowOnFormSubmitErrorStateMatcher`) and "should not be in error state when invalid but pristine" (`ShowOnControlDirtyErrorStateMatcher`). Each changes the matcher, and the first also the control, without running change detection, so `errorState()` still holds its initial `false`.
- "should emit VALID via statusChanges on blur": `VALID` comes from `setValue`; the blur part asserts that nothing more is emitted.
- `input-password.spec.ts` "should apply validation rules on blur": the `maxlength` error comes from the input event and is there without the blur.
- "should change visibility of toggle if form field disabled and empty": the toggle follows the disabled state only; emptiness plays no part.
- The cleaner, hint, prefix and suffix cases in `input.spec.ts` test the form field rather than the input.
- The e2e "text visible" case takes only the light screenshot.

**Behaviour without a test.** The spec states these from the source:

- applying `type` to the element, and the error for an unsupported type;
- the never-empty date and time types;
- a click on the form field container focusing the input, and disabling resetting the focused state;
- a bound form control's disabled state taking precedence over `disabled`;
- `required` setting the native property;
- the error state staying off without a form control;
- a value set in code on `kbqInput` not reaching the form control;
- a value written by a form into the number input not being reported back to it;
- a typed `.` being rendered as the locale's fraction separator;
- the keys blocked by the number input other than the minus and the second fraction separator, and the separator keys blocked in integer mode;
- a paste replacing the whole text;
- the empty field after unparseable typed text (only the `null` model is tested);
- a lone `-` keeping the previous value in the form;
- stepping moving focus to the field, and typed values outside `min` and `max` being kept;
- negative values left ungrouped under a threshold;
- runtime changes of `withThousandSeparator` and `startFormattingFrom` not re-rendering;
- `aria-valuenow` and `aria-valuetext` being absent while the field is empty;
- `disabledChange`, and the blur on disabling;
- `kbqInputLocaleConfigurationProvider` and `[localeOverrides]` on the number input;
- the separators of `pt-BR`, `es-LA` and `tk-TM`;
- the `kbq-input-password` class and the overwritten `type` attribute of the password input;
- the `kbq-form-field-type-input` and `kbq-form-field-type-input-password` classes.
