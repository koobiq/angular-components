# Tasks

No source, test or docs file changes in this change. Every task checks the spec against the code. When a check disagrees, correct `specs/radio/spec.md`, not the code, and move the behaviour to the Findings in `design.md` if it looks like a defect.

## 1. Check the spec against the existing tests

- [ ] 1.1 Run `yarn run styles:build-all`, then `npx vitest run packages/components/radio`, and verify the radio unit suite passes on the baseline commit
- [ ] 1.2 Run `yarn run e2e:docker yarn playwright test packages/components/radio` and verify the radio e2e suite passes. It backs "Button height", and its screenshot shows the sizes, the error color, both label positions, hints and the disabled state
- [ ] 1.3 For each requirement in `specs/radio/spec.md`, name at least one unit or e2e test that asserts it. Verify that every requirement without such a test is listed under "Behaviour without a test" in `design.md`

## 2. Check code-only behaviour in the dev app

`dev:radio` exists in `package.json`. Run each check in `yarn run dev:radio` (http://localhost:3003), which embeds the five docs examples and the ngModel, error, disabled and "Disabled selected buttons" groups of the dev template. Code writes go through the DevTools console of the dev build: `ng.getDirectives(element)` returns the group or button instance.

- [ ] 2.1 Verify in the DOM of the docs examples:
    - the normal and big groups of "Radio size" have `kbq-radio-group_normal` and `kbq-radio-group_big`;
    - a group without a color has `kbq-empty`, and the error group of "Radio style" has `kbq-error` and `aria-invalid="true"`;
    - a checked button's host has `kbq-selected`, and a disabled button's host has `kbq-disabled` and a disabled input with `tabindex="-1"`;
    - each button host has an id `kbq-radio-<n>`, its native input the id `<id>-input`, and its `<label>` a matching `for`
- [ ] 2.2 Verify the native keyboard in the "Radio group" example:
    - Tab enters the group at the checked button, and the next Tab leaves the group;
    - the arrow keys move between the buttons and check each one, skipping the disabled "Item 5";
    - Space checks the focused button;
    - in the ngModel groups of the dev template, the "Your favorite fruit is" line follows the arrow keys
- [ ] 2.3 Verify events and code writes with the ngModel groups of the dev template, which log every `KbqRadioChange` to the console:
    - each pick logs one event whose `source` is the clicked button and whose `value` is its value, and clicking the checked button again logs nothing;
    - a click on a button's "kbq-hint" caption checks that button;
    - `group.value = 'Banana'` from the console checks "Banana" without a log, and the "Your favorite fruit is" line does not change;
    - `group.selected = null` unchecks every button;
    - `group.color.set('error')` gives the group `kbq-error` and `aria-invalid="true"`;
    - each of these writes reaches the DOM without calling `ng.applyChanges`;
    - `group.radios.length` equals the number of buttons, and `group.markRadiosForCheck()` runs without an error
- [ ] 2.4 Verify the behaviour the dev template has no markup for. Add these scenarios to `packages/components-dev/radio/template.html` locally, and revert the file before 3.2:
    - a group with `name="answer"` inside a `<form>`: `new FormData(form).get('answer')` is the checked value, and a button without a value has no `value` attribute on its input;
    - two buttons outside a group: a click checks each one and emits `change`, and both stay checked;
    - a group with a bare `required` attribute and a `FormControl` without validators: the group has `aria-required="true"`, every native input is `required`, and the empty control stays valid;
    - a group with a bare `big` attribute stays normal;
    - a button with `[id]="'delivery'"` has the ids `delivery` and `delivery-input`, and one bound to `null` keeps a generated id;
    - a `(change)` listener on a `kbq-radio-button` receives only `KbqRadioChange` objects, and a `(click)` listener on a wrapper element sees one click per click on the label;
    - a button rendered later by an `@if`, whose value equals the group value kept from before, is checked when it appears;
    - with object values, a group value that is an equal but different object checks no button;
    - a group bound with `formControlName` inside a `[formGroup]` reads and writes its control

## 3. Final checks

- [ ] 3.1 Run `openspec validate document-radio-baseline --strict` and verify it reports the change as valid
- [ ] 3.2 Run `git status --short` and verify that nothing outside `openspec/` has changed, the dev template of 2.4 included

## Workflow follow-up

- Archive with `/opsx:archive document-radio-baseline` once the checks pass. This creates `openspec/specs/radio/spec.md`.
- Decide which Findings in `design.md` become changes of their own. The button without a value that a `null` group value checks, and the button with its own name that leaves two buttons checked, are the most user-visible ones.
