# Tasks

No source, test or docs file changes in this change. Every task checks the spec against the code. When a check disagrees, correct `specs/checkbox/spec.md`, not the code, and move the behaviour to the Findings in `design.md` if it looks like a defect.

## 1. Check the spec against the existing tests

- [ ] 1.1 Run `yarn run styles:build-all`, then `npx vitest run packages/components/checkbox`, and verify the checkbox unit suite passes on the baseline commit
- [ ] 1.2 Run `npx vitest run packages/components/core/common-behaviors/checkable.spec.ts packages/components/core/common-behaviors/color.spec.ts` and verify the core suites the spec leans on pass
- [ ] 1.3 Run `yarn run e2e:docker yarn playwright test packages/components/checkbox` and verify the checkbox e2e suite passes. It backs the size, cursor, hint, label position and `error` palette requirements
- [ ] 1.4 For each requirement in `specs/checkbox/spec.md`, name at least one unit or e2e test that asserts it. Verify that every requirement without such a test, or backed only by a core test, is listed under "Behaviour without a test" in `design.md`

## 2. Check code-only behaviour in the dev app

`dev:checkbox` is defined in `package.json` (`ng serve dev-checkbox --port 3003`). Run `yarn run dev:checkbox` and open http://localhost:3003. The build is not optimized, so the browser console has Angular's `ng` debugging API: `c = ng.getComponent(el)` returns the checkbox for a `kbq-checkbox` element `el`, and `ng.applyChanges(el)` renders it. The two checkboxes of the "checked" row share one `ngModel`, so a change that reaches the form shows up in the other one. Checks marked "temporary" need a line added to `packages/components-dev/checkbox/template.html` (and `ReactiveFormsModule` to `module.ts` for reactive forms). Revert those edits before 3.2.

- [ ] 2.1 Verify the keyboard and the click events:
    - Tab to a checkbox and press Space: it toggles and a `c.change.subscribe(...)` logger fires once;
    - a `click` listener added to the host with `el.addEventListener` fires once for a click on the label and not for Space;
    - with the host set to `display: block` in the DOM inspector, a click to the right of the label does not toggle it
- [ ] 2.2 Verify code writes in the "checked" row:
    - `c.checked = !c.checked` followed by `ng.applyChanges(el)` changes only that checkbox, not its twin, and emits no `change`;
    - `c.toggle()` changes both, so the form received the value, and emits no `change`;
    - in the overview example, a click on "Unchecked" (bound `[checked]="false"`) leaves it checked
- [ ] 2.3 Verify the indeterminate behaviour on the "indeterminate" row:
    - with `c.change.subscribe(() => console.log(c.indeterminate))`, a click logs `true` and the checkbox then shows as checked and not indeterminate;
    - `c.indeterminateChange.subscribe(console.log)` logs once for two consecutive `c.indeterminate = true` assignments;
    - `c.indeterminate = true` on a checked checkbox shows the mixed mark while the native input has `aria-checked="true"`
- [ ] 2.4 Verify the click actions (temporary): `clickAction="check"` on an indeterminate checkbox toggles `checked` and keeps it indeterminate; `clickAction="noop"` changes nothing and emits no `change`; providing `KBQ_CHECKABLE_CLICK_ACTION` as `noop` in the dev component's `providers` leaves the checkbox clickable, and `[clickAction]="undefined"` with `KBQ_CHECKBOX_CLICK_ACTION` provided as `noop` toggles on click
- [ ] 2.5 Verify layout and color in the DOM:
    - in the overview example, the hint declared before the text renders under it;
    - in the multiline example, the text wraps and the box stays at the first line;
    - a checkbox without `color` has `kbq-empty`;
    - no checkbox ever gets `aria-invalid` or `kbq-error` unless `color` is `error`
- [ ] 2.6 Verify focus and tab order:
    - disabled checkboxes in the table have `tabindex="-1"` on their native input;
    - `c.focus()` gives the native input `cdk-keyboard-focused` and draws the focus outline;
    - (temporary) `tabIndex="abc"` renders `tabindex="0"`, and `checked="false"` renders an unchecked checkbox
- [ ] 2.7 Verify that clicks and Space on the disabled checkboxes in the table change neither them nor the checkboxes that share their `ngModel`
- [ ] 2.8 Verify forms (temporary):
    - `required` with `formControl` and with `formControlName` makes the control invalid with a `required` error while unchecked and valid while checked;
    - `control.setValue(1)` checks the checkbox;
    - a `change` handler reads the control's new value
- [ ] 2.9 Verify in the accessibility pane of the browser's developer tools that the native input of the overview example's "Default" checkbox has the role `checkbox` and a name made of its label text and its hint text
- [ ] 2.10 Verify that `tools/public_api_guard/components/checkbox.api.md` lists `kbqCheckbox` as the component's template reference and that `KbqCheckboxModule` exports `KbqCheckboxRequiredValidator`

## 3. Final checks

- [ ] 3.1 Run `openspec validate document-checkbox-baseline --strict` and verify it reports the change as valid
- [ ] 3.2 Run `git status --short` and verify that nothing outside `openspec/` has changed, including the temporary dev app edits

## Workflow follow-up

- Archive with `/opsx:archive document-checkbox-baseline` once the checks pass. This creates `openspec/specs/checkbox/spec.md`.
- Decide which Findings in `design.md` become changes of their own. The missing accessible name for a checkbox without label text is the most user-visible one.
