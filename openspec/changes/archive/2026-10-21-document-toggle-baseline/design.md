# Design

## Context

See proposal.md for why. The spec describes `main` at `c9c196a9b`. Its sources are:

- `packages/components/toggle/`: the component, its template and styles, the unit spec, `e2e.ts` and the Playwright spec;
- the shared checkable behaviour (`common-behaviors/checkable.ts` and its spec), the color directive and the animation helpers in `packages/components/core`;
- the `toggle.{en,ru}.mdx` pages, the examples under `packages/docs-examples/components/toggle/` and the dev app in `packages/components-dev/toggle/`;
- the API golden file `tools/public_api_guard/components/toggle.api.md`.

Every claim in the spec was checked against the source. `openspec/specs/` holds only `select` so far, and its archived change `2026-10-21-document-select-baseline` sets the pattern this change follows. `examples.toggle.{en,ru}.mdx` are placeholders, and `structure.ts` does not route to them (`hasExamples: false`).

## Goals / Non-Goals

**Goals:**

- A contract a consumer can rely on: every requirement is observable from outside the component, and every scenario can be checked by an existing test or by hand in the dev app.
- One place to diff against when toggle behaviour changes later.

**Non-Goals:**

- Fixing anything found along the way (see Findings).
- Internals: the shared checkable directive's own API, private members, the animation state machine, CSS structure and design tokens.
- `kbq-checkbox`, `kbq-button-toggle` and deprecated APIs such as `onLabelTextChange()`.
- Changes to tests, docs or examples.

## Decisions

1. **The general decisions follow the select baseline.** One capability at a flat path (`toggle`), written in English; the spec describes what ships, quirks included; only behaviour confirmed by a test or read in the source goes in; and the contract is public names, selectors, host classes, ARIA attributes and exported tokens.
2. **The shared checkable behaviour is specified through the toggle.** Checked, disabled and indeterminate state, click resolution and the forms plumbing live in a directive in `core` that `kbq-checkbox` shares. A separate `checkable` capability was considered and rejected: consumers reach that behaviour only through a host, and the toggle changes it on the way (loading declines clicks, Enter is forwarded, `indeterminate` is cleared in a microtask). A later checkbox baseline states its own version.
3. **Tests in `checkable.spec.ts` count only where the toggle passes behaviour straight through.** That spec drives the directive through its own test host, not through `kbq-toggle`. Where it is the only test, as for the `check` click action or the `ngModel` round trip, the requirement is listed under "Behaviour without a test" and checked by hand.
4. **Quirks stated as they ship.** Examples:
    - `checked` cannot be two-way bound;
    - `indeterminateChange` also fires for changes made in code;
    - a click clears `indeterminate` only after `change`, in a microtask;
    - `aria-describedby` points to the hint container even when there is no hint;
    - a keyboard switch dispatches no click on the host;
    - `big` is not coerced from a bare attribute.

    Each fix belongs in its own change, with a `MODIFIED` delta.

5. **Two sizes count as contract.** The switch staying 28 by 16 px when `big`, and the height of one text line (20 or 24 px), are in the spec because the docs promise them and the e2e suite asserts them. All other styling stays out.

## Risks / Trade-offs

- [The spec drifts from the code] → A change to `packages/components/toggle` updates `openspec/specs/toggle/spec.md` with a delta. Reviewers check it the same way they check the API golden file.
- [A change to the shared checkable directive in `core` alters the toggle without touching its directory] → A change to `core/common-behaviors/checkable.ts` is reviewed against this spec as well as the checkbox.
- [Some requirements rest on the source or on the shared test host rather than on a toggle test] → tasks.md checks each of them by hand in `yarn run dev:toggle` before archiving. A mismatch is corrected in the spec, not in the code.
- [A defect gets recorded as intended behaviour] → Suspected defects stay out of the spec and are listed under Findings. Behaviour the spec does state can change later through `MODIFIED`.

## Findings

These are recorded, not fixed, in this change. Each can become a change of its own.

**Docs and JSDoc that disagree with the code**

1. The JSDoc of `indeterminate` is copied from the checkbox. It speaks of "a checkbox with three states" and says a click sets `indeterminate` to `false` "immediately". The toggle clears it in a microtask, after `change`, and with the `check` and `noop` click actions it does not clear it at all.
2. The `toggle-indeterminate` and `toggle-loading` examples render a toggle with no label text, `aria-label` or `aria-labelledby`, so its checkbox has no accessible name. The accessibility section of the same page asks for one.
3. The `toggle-with-hint` example says "When this witch is off"; it means "switch".
4. The "Error" section shows only `color="error"`. It does not say that the toggle never takes an error state from an invalid form control, as other form controls do.
5. These have no place in the toggle pages:
    - forms integration (`ngModel`, `formControl`) — every example binds `[checked]` and `(change)`;
    - Enter switching the toggle;
    - `indeterminateChange` and `[(indeterminate)]`, and the absence of `[(checked)]`;
    - `id`, `tabIndex`, `focus()` and `getAriaChecked()`.
6. The golden file marks `KbqToggleComponent` and most of its members `(undocumented)`: `change`, `big`, `labelPosition`, `name`, `value`, `focus()`, `getAriaChecked()` and `inputId`, among others. The template handlers `onChangeEvent()` and `onInputClick()` are public and carry neither JSDoc nor `@docs-private`.

**Suspected defects (from reading the code, not reproduced)**

1. Static `tabIndex`, `aria-label` and `aria-labelledby` attributes written on `<kbq-toggle>` stay on the host element as well as reaching the checkbox, because nothing clears them on the host. A static `tabIndex` would make the host a second tab stop. An `aria-label` on a host without a role may be reported by axe (`aria-prohibited-attr`). Bound values such as `[tabIndex]` are not affected.
2. `big` has no boolean transform, unlike `disabled`, `checked`, `indeterminate` and `loading`. A bare `big` attribute gives an empty string, so the toggle stays at its normal size, and strict template type checking rejects it.
3. With the `check` click action, a click on an indeterminate toggle clears the `indeterminate` property of the native checkbox. The component stays indeterminate, and its unchanged binding does not set the property again. The impact is low, because assistive technology reads the explicit `aria-checked`.
4. No unit test runs axe on the toggle (`toHaveNoViolations` is not used in its spec). So finding 1 above and the unnamed examples go unnoticed.

**Tests whose name and body disagree, or that cannot fail**

- "should make the host element a tab stop" asserts the tab index of the inner checkbox; the host is not a tab stop.
- "should not trigger the change event by changing the native value" changes the `checked` binding, not the native value.
- "with ngModel › should toggle checked state on click" never reads the model. No toggle test checks that a click reaches the form.
- The "without label" group tests the `name` and `value` attributes. Its fixture has a label binding that is only empty.
- "should trigger a change event when the native input does" counts the calls but never checks the `KbqToggleChange` it receives.
- "should toggle on enter without submitting the enclosing form" checks `defaultPrevented` only; it does not observe a submit.
- "should should not clear previous defined classes" repeats a word. The color tests use `primary` and `accent`, which are not `KbqComponentColors` values and have no style.
- The e2e "should expose the loading state to assistive technology" asserts `toBeDisabled()`. Playwright accepts `aria-disabled` alone for that, while the unit test asserts that the native checkbox is not disabled, so the two read as contradicting each other.
- The e2e "should have correct size" asserts the same 28 by 16 px switch before and after `big`. The name does not say that the size is meant to stay.

**Behaviour without a test.** The spec states these from the source:

- writing `checked` in code does not reach a bound form control;
- the content of the `KbqToggleChange` payload;
- no `checkedChange` output, so `checked` is one-way;
- no click event on the host for a keyboard switch;
- Space switching the toggle;
- the focus origin classes on the host, and the keyboard origin of `focus()`;
- `aria-disabled="true"` and `tabindex="-1"` on a disabled toggle (the tab index only through the shared test host);
- coercion of `indeterminate`, `loading` and the string `"false"`, and no coercion for `big`;
- no error state taken from forms;
- `indeterminateChange` for changes made in code, and `[(indeterminate)]`;
- `indeterminate` cleared after `change`, in a microtask;
- keys ignored while loading;
- `aria-describedby` set without a hint;
- the `value` attribute when `value` is given;
- the `check` click action on the toggle (only through the shared test host);
- through the toggle: the form value after a click, the dirty state, truthy coercion of written values and `formControlName` (only `ngModel` and value coercion, through the shared test host);
- the form value being current in the `change` handler;
- touched on a user switch;
- a `tabIndex` that is not a number giving `0`;
- motion turned off by noop animations;
- `getAriaChecked()` called on the toggle;
- the `kbqToggle` template reference.
