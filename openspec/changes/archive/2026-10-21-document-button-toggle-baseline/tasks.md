# Tasks

No source, test or docs file changes in this change. Every task checks the spec against the code. When a check disagrees, correct `specs/button-toggle/spec.md`, not the code, and move the behaviour to the Findings in `design.md` if it looks like a defect.

## 1. Check the spec against the existing tests

- [ ] 1.1 Run `yarn run styles:build-all`, then `npx vitest run packages/components/button-toggle`, and verify the button-toggle unit suite passes on the baseline commit
- [ ] 1.2 Run `yarn run e2e:docker yarn playwright test packages/components/button-toggle` and verify the button-toggle e2e suite passes. It backs the hit area, label truncation, tooltip, slotted-icon and stretched-layout requirements and the Tab-then-arrow scenario
- [ ] 1.3 For each requirement in `specs/button-toggle/spec.md`, name at least one unit or e2e test that asserts it. Verify that every requirement without such a test is listed under "Behaviour without a test" in `design.md`

## 2. Check code-only behaviour in the dev app

`dev:button-toggle` exists in `package.json` (`ng serve dev-button-toggle --port 3003`). Run each check in `yarn run dev:button-toggle` at http://localhost:3003. Where a check needs code, run it in the browser console with the Angular development helpers: `ng.getComponent(toggleElement)` for a toggle, `ng.getDirectives(groupElement)` for the group and its `NgModel`, then `ng.applyChanges(element)`.

- [ ] 2.1 Verify in the DOM:
    - every inner button has `type="button"`;
    - in "Horizontal Group", the checked and disabled "default 4" has `kbq-selected` and `kbq-disabled`, and tabbing into the group lands on "default 1";
    - `kbq-selected` moves between toggle elements as the selection changes
- [ ] 2.2 Verify the disabled group in "DisableGroup":
    - after "Toggle Disabled", every toggle has `kbq-disabled` and the group element has no disabled class and no `aria-disabled`;
    - after a second "Toggle Disabled", "default 2" is still disabled and the other toggles are enabled
- [ ] 2.3 Verify pointer and keyboard activation in "Group With Model", in this order after a reload:
    - tabbing onto the group and away without a change leaves the `NgModel` untouched;
    - after assigning `1` to the group's `value` from the console, a click on the now selected "default 1" leaves "Model result" empty and the `NgModel` untouched;
    - Right on the focused "default 1" selects "default 3", skipping the disabled "default 2", shows 3 in "Model result" and marks the `NgModel` dirty and touched
- [ ] 2.4 Verify changes made in code in "Group With Model": set `checked = true` on the "default 3" toggle from the console and verify that it is selected while "Model result" keeps its previous value and the `NgModel` stays pristine
- [ ] 2.5 Verify the multiple-mode value in "Multiple Group":
    - Space on a focused toggle flips it;
    - clicking "default 3" and then "default 1" shows "Selected value: 3,1";
    - assigning `[3, 1]` to the group's `value` from the console makes it read `[1, 3]`;
    - `selected` is an array of toggles
- [ ] 2.6 Verify the tooltip in "Group With Overflown text": Tab onto the truncated toggle shows the tooltip with the full label, and a mouse click on it does not
- [ ] 2.7 Verify `iconType` in `yarn run dev:e2e` at http://localhost:4200/E2eButtonToggleStates: switching on "show prefix icon" and then off "show title" gives the first toggles the `kbq-button-toggle-icon-text` class and then `kbq-button-toggle-icon`
- [ ] 2.8 The dev app has no toggle named with `aria-labelledby` and no right-to-left group. Verify by reading the toggle's template in `button-toggle.component.ts` that `aria-labelledby` is bound onto the inner button, and leave the right-to-left keys to the unit tests

## 3. Final checks

- [ ] 3.1 Run `openspec validate document-button-toggle-baseline --strict` and verify it reports the change as valid
- [ ] 3.2 Run `git status --short` and verify that nothing outside `openspec/` has changed

## Workflow follow-up

- Archive with `/opsx:archive document-button-toggle-baseline` once the checks pass. This creates `openspec/specs/button-toggle/spec.md`.
- Decide which Findings in `design.md` become changes of their own. The selection that ignores a runtime change of `multiple` and the form control that never hears about changes made in code are the most consequential.
