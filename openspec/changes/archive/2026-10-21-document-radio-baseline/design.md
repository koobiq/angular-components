# Design

## Context

See proposal.md for why. The spec describes `main` at `c9c196a9b`. Its sources are:

- `packages/components/radio/`: `radio.component.ts` (`KbqRadioGroup` and `KbqRadioButton`), `radio.component.html`, `radio.scss` and `_radio-theme.scss` where they decide which classes matter, `radio.spec.ts`, `e2e.ts` and `e2e.playwright-spec.ts`, and the `radio.{en,ru}.mdx` and `examples.radio.{en,ru}.mdx` pages;
- the five docs examples under `packages/docs-examples/components/radio/` and the dev app in `packages/components-dev/radio/`;
- the parts of `packages/components/core` the radio relies on: `KbqColorDirective`, `kbqOptionalNumberAttribute`, `kbqQueryListFrom` and the `kbqPopoverPreventHide` check in the pop-up trigger; and `KbqHint` from `form-field`;
- the API golden file `tools/public_api_guard/components/radio.api.md` and the radio section of `docs/guides/migration.en.mdx`.

Every claim in the spec was checked against the source. `openspec/specs/` holds only the select spec, and this change follows its pattern.

## Goals / Non-Goals

**Goals:**

- A contract a consumer can rely on: every requirement is observable from outside the components, and every scenario can be checked by an existing test or by hand in the dev app.
- One place to diff against when radio behaviour changes later.

**Non-Goals:**

- Fixing anything found along the way (see Findings).
- Internals: private members, the selection dispatcher, change-detection details, CSS structure below the host, and design tokens.
- `kbq-checkbox`, `kbq-toggle`, `kbq-button-toggle`, and `kbq-form-field` beyond the `kbq-hint` a button projects.
- Changes to tests, docs or examples.

## Decisions

1. **The general decisions follow the select baseline**: English, the spec describes what ships with its quirks, only confirmed behaviour goes in, and suspected defects stay out of the spec and go to Findings.
2. **One capability, `radio`, for the group and the button.** The path matches the entry point. A split into `radio-group` and `radio-button` was considered and rejected: the selection, the name, the disabled and required state and the events are shared between the two, so almost every change would touch both.
3. **The native keyboard is part of the contract.** The components add no key handlers; the browser supplies Tab, the arrow keys and Space. The spec still states that behaviour, because the docs promise it and a change that adds key handlers or a roving tab index would alter it. jsdom cannot press those keys, so tasks.md checks them by hand.
4. **Code writes stay silent, and that is stated.** Writing `value`, `selected` or `checked` in code emits no `change` and does not reach the bound form control. The spec states it as shipped, the same way the select baseline does; the case where it makes a form-bound group and its control disagree is listed under Findings.
5. **The spec steps around the suspected defects instead of blessing them.** "Clearing the group value" speaks of "every button that has a value", because a button without a value is checked by a `null` group value. "Button name" says only which name a button takes, not what checking a separately named button does to its group.
6. **What counts as contract.** Public inputs, outputs, methods and properties; the selectors and `exportAs` names; host classes (`kbq-radio-group_normal`, `kbq-radio-group_big`, `kbq-radio-button_big`, `kbq-selected`, `kbq-disabled`, `kbq-<color>`, and the CDK focus-origin classes); ARIA attributes; the ids of the native input; and the attributes a native form reads. Classes of inner elements, such as the one that puts the label before the circle, do not count. The 20 px and 24 px button heights do, because an e2e test asserts them; the rest of the visual states are styling and stay out.

## Risks / Trade-offs

- [The spec drifts from the code] → A change to `packages/components/radio` updates `openspec/specs/radio/spec.md` with a delta. Reviewers check it the same way they check the API golden file.
- [Some requirements rest on the source rather than on a test] → tasks.md checks each of them by hand in `yarn run dev:radio` before archiving. A mismatch is corrected in the delta, not in the code.
- [The native keyboard depends on the browser] → It is checked by hand in a real browser. A Playwright test would be the durable check; adding one is a change of its own.
- [A defect gets recorded as intended behaviour] → Suspected defects stay out of the spec. Behaviour the spec does state can change later through `MODIFIED`.

## Findings

These are recorded, not fixed, in this change. Each can become a change of its own.

**Docs and JSDoc that disagree with the code**

1. The JSDoc of the button's `change` says it fires "when the checked state of this radio button changes". It never fires when the button is unchecked. Both `change` outputs also write `<input type-"radio">` for `<input type="radio">`.
2. The group's `value` is documented as "Value of the radio button." and its `selected` as "Whether the radio button is selected." The first is the group's value; the second is a button or `null`, not a boolean.
3. The JSDoc of `KbqRadioChange` says it is "emitted by KbqRadio", a class that does not exist. For the group's event, `source` is the checked button, not the emitter.
4. `radio.en.mdx` and `radio.ru.mdx` say the group's `focus()` forwards to the checked option. When nothing is checked it goes to the first enabled button; only the JSDoc says so.
5. `big` has no JSDoc (the API report marks it undocumented), and no docs page names it. Unlike `disabled` and `required`, it does not coerce strings, so a bare `big` attribute leaves the group normal.
6. The JSDoc of `touch()` says the buttons call it "upon their blur". They also call it on every user selection, so a click marks the control touched before focus leaves.
7. The group's `change` is documented as emitted only on user interaction, but the public `emitChangeEvent()` emits it from code.
8. `examples.radio.en.mdx` and `examples.radio.ru.mdx` are "Documentation in progress" placeholders. `structure.ts` sets `hasExamples: false`, so no route reaches them.

**Suspected defects (from reading the code, not reproduced)**

1. A button with no `value` inside a group whose value is `null`, which is the default, is checked: on init, because a button reads `group.value === value` and both are `null`, and again each time the group value is cleared to `null`. With several such buttons the last one stays checked. The group's `selected` is not set on init.
2. The migration guide says a button with its own `[name]` inside a group "forms its own selection group". Checking it still sets the group's `value` and `selected`, but does not uncheck the group-named button that was checked, so two buttons show as checked. Clicking the old one afterwards fires no `change`, because its native input is still checked, so the user cannot return the group value to it. The dev app's "Disabled selected buttons" groups use this pattern.
3. Two buttons with the same value in one group: writing that value seems to end, through a re-entrant uncheck, with no button checked and the group value reset to `null`, without telling the form control.
4. A `[checked]` binding on a button of a group bound to `formControl` or `ngModel` changes what the group shows without updating the control (see Decision 4), so the two can disagree from the first render.
5. The group's `focus()` targets the selected button even when that button is disabled, so focus does not move. The fallback to the first enabled button applies only when nothing is selected.

**Tests whose name and body disagree, or that cannot fail**

- "should move the group value on the change event an arrow key produces natively" sets `checked` and dispatches `change` by hand. No key is pressed, so a regression in the browser's arrow-key handling cannot fail it.
- The JSDoc of `describe('reactivity')` says it pins the contract for `disabled`, `value` and `selected`; its only test writes `disabled`.
- "should give the buttons the big size of the group" sits under `describe('accessibility')`; it checks size.
- "should deselect all of the radio buttons when the group value is cleared" passes only because every button in the fixture has a value, so it cannot catch suspected defect 1.
- "should keep an explicit name on a radio button inside a group" checks the names only, not what checking that button does to the group (suspected defect 2).
- "should report a boolean from required for a radio button outside a required group" uses a button inside a group that is not required; the name reads as if the button had no group.
- "should emit a change event from radio buttons" and the group `change` tests count calls only. No test checks the `source` or `value` of a `KbqRadioChange`.

**Behaviour without a test.** The spec states these from the source:

- the group classes `kbq-radio-group_normal` and `kbq-radio-group_big`, and `big` not coercing strings;
- the `kbq-empty` default color, a color written in code, and the error palette of a single button (only the screenshot shows it);
- a click on the hint selecting the button;
- `radios` listing the buttons and being empty before the content is initialized;
- object values matching by reference, and a button added later taking a kept group value;
- `selected` written through the property, and written as `null`;
- the button's `change` staying silent for an already checked button and for code writes;
- the payload of both `change` events and the order of the notifications;
- the native `change` and `click` events not leaving the button;
- a button outside a group checked by a click and emitting `change`, and its name falling back to its unique id after a `[name]` binding changes to `undefined`;
- the format and uniqueness of the generated group name, and no `value` attribute for a `null` value;
- `formControlName`, and code writes not reaching the form control;
- the host classes `kbq-selected` and `kbq-disabled` (only the screenshot shows them), and `tabindex="-1"` on a disabled button;
- the native `required` attribute, coercion of a bare `required`, and the absence of a validator of the group's own;
- the native keyboard: one tab stop per name, the arrow keys, Space;
- the host id, the `-input` id, the label's `for`, and the fallback for a `null` or empty `id`;
- re-rendering after code writes other than the group's `disabled`;
- `markRadiosForCheck()` and `markForCheck()`;
- the `exportAs` names.
