# Tasks

No source, test or docs file changes in this change. Every task checks the spec against the code. When a check disagrees, correct `specs/accordion/spec.md`, not the code, and move the behaviour to the Findings in `design.md` if it looks like a defect.

## 1. Check the spec against the existing tests

- [ ] 1.1 Run `yarn run styles:build-all`, then `npx vitest run packages/components/accordion`, and verify the accordion unit suite passes on the baseline commit
- [ ] 1.2 Run `yarn run e2e:docker yarn playwright test packages/components/accordion` and verify the accordion e2e suite passes. It backs the variant placement, keyboard focus ring, natural content height and animated collapse requirements, and the disabled item expanded by `defaultValue`
- [ ] 1.3 For each requirement in `specs/accordion/spec.md`, name at least one unit or e2e test that asserts it. Verify that every requirement without such a test is listed under "Behaviour without a test" in `design.md`

## 2. Check code-only behaviour in the dev app

`dev:accordion` exists in `package.json`. Run each check in `yarn run dev:accordion` (http://localhost:3003), which embeds every docs example and a multiple-mode accordion. Reach component instances from the browser console with `ng.getComponent(element)` and `ng.getDirectives(element)`. Where a check needs markup the dev app does not have, add it to `packages/components-dev/accordion/template.html` temporarily and revert it before 3.2.

- [ ] 2.1 Verify the keyboard in the "inactive section" example:
    - Down from the second trigger skips the disabled third one;
    - Down on the last trigger and Up on the first do nothing;
    - Left, Right and Shift+Down do nothing;
    - Tab still stops on the disabled trigger;
    - Space on the disabled trigger does not expand it
- [ ] 2.2 Verify in the "interactive elements" example that tabbing onto a header action, or into an input of the expanded content, shows no focus border on the item, while tabbing onto a trigger does
- [ ] 2.3 Verify the pointer and the trigger:
    - a click on a trigger in the overview example, whose triggers sit directly in the items, toggles the item and leaves the trigger focused;
    - the chevron has `aria-hidden="true"` and the trigger's accessible name in the accessibility tree is its text
- [ ] 2.4 Verify the value rules on the overview example from the console:
    - after the user expands an item, `value()` is still `''`;
    - `valueChange` subscribed on the dev app's multiple accordion logs an array once per expanded or collapsed item, and once per item for `openAll()`
- [ ] 2.5 Verify the disabled rules from the console in the "inactive section" example:
    - `open()`, `toggle()` and `closeAll()` leave the disabled item collapsed;
    - setting its `expanded` to `true` expands it;
    - expanding another item then collapses it
- [ ] 2.6 Verify with temporary markup:
    - `[defaultValue]="['item-1', 'item-2']"` in single mode expands only `item-1`, and changing `defaultValue` afterwards changes nothing;
    - changing an item's `[expanded]` binding after the first render expands it and emits `opened` once;
    - `[collapsible]="false"` in single mode still collapses the expanded item when another one opens;
    - a one-way `[value]` does not stop the user from toggling items;
    - `orientation="horizontal"` makes Up and Down move focus, and Left moves forward under `dir="rtl"`
- [ ] 2.7 Verify the motion:
    - the DevTools Animations panel shows a 300 ms height transition on expand and collapse;
    - after expanding an item in the "state saving" example and reloading, the item appears expanded with its chevron turned and no animation
- [ ] 2.8 Verify state saving in the "state saving" example: `hasSavedState` is `true` after an item is expanded and `false` after "Reset saved state". With temporary markup, verify that an accordion nested in an item's content writes only its own item values under its own key
- [ ] 2.9 Read `close()`, `closeAll()` and `clearSavedState()` in the source and verify that each runs its body inside `untracked`, as the effect requirement states

## 3. Final checks

- [ ] 3.1 Run `openspec validate document-accordion-baseline --strict` and verify it reports the change as valid
- [ ] 3.2 Run `git status --short` and verify that nothing outside `openspec/` has changed, the temporary dev app markup included

## Workflow follow-up

- Archive with `/opsx:archive document-accordion-baseline` once the checks pass. This creates `openspec/specs/accordion/spec.md`.
- Decide which Findings in `design.md` become changes of their own. The keyboard bypassing `collapsible="false"` and the stale first `valueChange` in single mode are the most user-visible ones.
