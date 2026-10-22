# Design

## Context

See proposal.md for why. The spec describes `main` at `c9c196a9b`. Its sources are:

- `packages/components/checkbox/`: the component, its template and styles, the config token, the required validator, the module, the unit spec, `e2e.ts`, the Playwright spec and its baselines, and the `checkbox.{en,ru}.mdx` and `examples.checkbox.{en,ru}.mdx` pages;
- the shared pieces it relies on in `packages/components/core`: `KbqCheckable` (state, click resolution, `aria-checked`, the forms value accessor), `KbqColorDirective`, `kbqOptionalNumberAttribute`, and their specs;
- Angular's `CheckboxRequiredValidator`, which the required validator extends;
- the docs examples under `packages/docs-examples/components/checkbox/`, the `dev-checkbox` app and the API golden file `tools/public_api_guard/components/checkbox.api.md`.

Every claim was checked against the source. Much of the behaviour lives in `KbqCheckable`, which `kbq-toggle` and custom controls also use, so some requirements rest on core tests that run against a test host rather than on `kbq-checkbox` itself.

## Goals / Non-Goals

**Goals:**

- A contract a consumer can rely on: every requirement is observable from outside the component, and every scenario can be checked by an existing test or by hand in the dev app.
- One place to diff against when checkbox behaviour changes later.

**Non-Goals:**

- Fixing anything found along the way (see Findings).
- The contract of `KbqCheckable` as a primitive for other controls, `kbq-toggle`, `kbq-pseudo-checkbox` and the "Block checkbox" example.
- Internals: private members, the transition state, wrapper classes such as `kbq-checkbox__inner-container_no-side-margin`, and design tokens.
- Changes to tests, docs or examples.

## Decisions

1. **The general decisions follow the select baseline** (`openspec/changes/archive/2026-10-21-document-select-baseline/design.md`): one capability at the flat path `checkbox`, English, the spec describes what ships with its quirks, only confirmed behaviour goes in, and suspected defects stay in the Findings. Examples of quirks stated as they ship:
    - the indeterminate state is cleared after `change` has fired;
    - a bound `undefined` click action ignores the injection token;
    - `toggle()` updates the form control but emits no `change`;
    - checked and indeterminate together show the mixed mark with `aria-checked="true"`.
2. **The native input is part of the contract.** Consumers and tests read the checkbox's state, id, name, value, tab index, `required` and `aria-checked` from the `<input type="checkbox">` inside the host, so its attributes count as contract. The wrapper classes inside the host do not, although the unit spec queries some of them.
3. **What counts as contract.** Besides the native input:
    - public inputs, outputs, methods and the `kbqCheckbox` template reference;
    - the injection token `KBQ_CHECKBOX_CLICK_ACTION` and its values;
    - host classes a consumer can style or test against (`kbq-checked`, `kbq-indeterminate`, `kbq-disabled`, `kbq-checkbox_big`, `kbq-checkbox_label-before`, `kbq-<color>`);
    - the host `id` and `disabled` attributes;
    - the heights and cursors the e2e suite asserts, and the `error` palette, which is how a consumer shows an invalid checkbox.
4. **Shared behaviour is stated where the consumer meets it.** State, click resolution, `aria-checked` and forms plumbing come from `KbqCheckable`, but the spec states them as checkbox behaviour. A change to `KbqCheckable` that alters what `kbq-checkbox` does needs a `MODIFIED` delta here. A requirement that only a core test backs is listed under "Behaviour without a test" when no checkbox test exercises it.
5. **The required validator is part of this capability.** It ships in the same entry point and module and only applies to `kbq-checkbox`.

## Risks / Trade-offs

- [The spec drifts from the code] → A change to `packages/components/checkbox` updates `openspec/specs/checkbox/spec.md` with a delta. Reviewers check it the same way they check the API golden file.
- [A change to `KbqCheckable` for `kbq-toggle` or a custom control silently changes the checkbox] → The core specs do not render `kbq-checkbox`. tasks.md maps each requirement to a test, and the gaps are listed below so a later change can add checkbox-level tests.
- [Some requirements rest on the source rather than on a test] → tasks.md checks each of them by hand in `yarn run dev:checkbox` before archiving. A mismatch is corrected in the delta, not in the code.
- [A defect gets recorded as intended behaviour] → Suspected defects stay out of the spec and are listed under Findings. Behaviour the spec does state can change later through `MODIFIED`.

## Findings

These are recorded, not fixed, in this change. Each can become a change of its own.

**Docs and JSDoc that disagree with the code**

1. The class JSDoc of `KbqCheckbox` says that without a label "you may supply an [aria-label] input". There is no such input: `aria-label` and `aria-labelledby` stay on the host element and do not reach the native input.
2. The JSDoc of `change` says it is emitted "when the checkbox's `checked` value changes". It fires only for a toggle by the user, not for the binding, the property set in code, `toggle()` or a value written by the form.
3. The JSDoc of `indeterminate` says a click sets it to `false` "immediately". It is cleared in a microtask after `change` has fired, and not at all with the `check` or `noop` click action.
4. The "Click action config" section names only the injection token. It does not mention the `clickAction` input, which overrides it, nor that `kbq-toggle` falls back to the same token.
5. The JSDoc of `KbqCheckboxRequiredValidator` speaks of a "template-driven checkbox", but the selector also matches `formControl` and `formControlName`.
6. The overview pages say nothing about:
    - `big`, `labelPosition`, `name`, `value` and `color`;
    - the projected `kbq-hint`;
    - required validation;
    - the lack of an error state of its own.

    The "Multiline" section has no text. The examples tab shows only the `KbqCheckable` "Block checkbox", not `kbq-checkbox`.

7. `checkbox.ru.mdx` writes the indeterminate binding as `` `[indeterminate] =" true "` `` and uses `«[indeterminate]»` quotes instead of code formatting.

**Suspected defects (from reading the code, not reproduced)**

1. A checkbox without label text cannot be given an accessible name: the native input has no `aria-label` binding, and the host's ARIA attributes are not forwarded. axe would report the input as unlabelled.
2. A projected `kbq-hint` sits inside the `<label>`, so its text joins the input's accessible name instead of being its description. There is no `aria-describedby`.
3. With `checked` and `indeterminate` both true, the box shows the mixed mark and the native input is indeterminate, but `aria-checked` is `true`. What assistive technology announces depends on whether the browser honours `aria-checked` on a native checkbox.
4. The checkbox reads only `KBQ_CHECKBOX_CLICK_ACTION`. `kbq-toggle` reads `KBQ_CHECKABLE_CLICK_ACTION` first and falls back to the checkbox token. Providing the shared token therefore changes the toggle and not the checkbox, and providing the checkbox token changes both.
5. The microtask that clears `indeterminate` after a default click writes `false` without checking the current value. If a `change` handler sets `indeterminate` to `true` in code, the microtask overwrites it and still emits `indeterminateChange(false)`.
6. Setting `checked` in code on a form-bound checkbox does not update the control, while `toggle()` does. The checkbox and its control can then disagree until the form writes again.
7. Binding `[clickAction]="undefined"` replaces the token's value with `undefined`, so the token is ignored for that checkbox.

**Tests whose name and body disagree, or that cannot fail**

- "should not toggle `checked` state upon interaction while disabled" clicks the host element. A click on the host never toggles, so the test would pass on an enabled checkbox too.
- "should not set `indeterminate` to false on click if check is set" sets `isIndeterminate` and clicks before change detection runs. The checkbox is not indeterminate at the click, so the test passes with the default action too. The indeterminate half of "should not change `indeterminate` on click if noop is set" has the same problem.
- "should make the host element a tab stop" checks the native input's `tabIndex`; the host is not a tab stop.
- "should trigger a change event when the native input does" carries a comment saying the change event "shouldn't fire", next to an assertion that it fired once.
- "should be in pristine, untouched, and valid states initially" keeps an old `TODO` to test `touched` and `pristine` changes, which was never done.
- "should should not clear previous defined classes" repeats a word. The color tests use `primary` and `accent`, which the checkbox has no styles for.
- The `CheckboxWithAriaLabel` and `CheckboxWithAriaLabelledby` fixtures are imported into the test module but no test renders them. `parentElementClicked` and `parentElementKeyedUp` of `SingleCheckbox` are never read.
- The "focused" state of the e2e `E2eCheckboxStateAndStyle` scenario puts `cdk-keyboard-focused` on the host. The focus style is keyed to that class on the native input, so the baseline shows no focus outline in that column, and the screenshot cannot catch a regression of the focus style.
- No spec runs axe on the checkbox.

**Behaviour without a test.** The spec states these from the source. Some are backed only by core tests that use a test host instead of `kbq-checkbox`; those are marked "core".

- Space toggles the checkbox;
- a click on the host outside the label area does not toggle it;
- the binding or the property set in code does not update the form control;
- bound `checked`, `disabled` and `indeterminate` apply only when their value changes;
- `toggle()` updates the form control (core) and emits no `change`;
- checked and indeterminate together show the mixed mark;
- `change` fires while `indeterminate` is still `true`;
- `indeterminateChange` fires for changes made through the binding or in code, and not for a repeated value;
- the `check` click action keeps `indeterminate` (core);
- the `noop` click action emits no `change` and does not update the form control;
- a bound `undefined` click action ignores the token, and `KBQ_CHECKABLE_CLICK_ACTION` has no effect;
- the form control holds the new value when `change` fires;
- a click on the native input does not propagate to the host;
- a hint declared before the label text is shown under it;
- long label text wraps with the box next to the first line;
- `kbq-empty` without a color;
- no error state of its own;
- the string `"false"` for a boolean input, and valueless `disabled` and `indeterminate`;
- a non-numeric `tabIndex`, and `-1` while disabled (core);
- `focus()` gives keyboard focus with the `cdk-keyboard-focused` class;
- a disabled checkbox ignores clicks and keys (core);
- `formControlName`, and a truthy value written by the form (core);
- required validation with `formControl` and `formControlName`, and the `required` error key;
- the accessible name from the label content;
- the `kbqCheckbox` template reference.
