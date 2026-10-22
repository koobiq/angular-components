# Tasks

No source, test or docs file changes in this change. Every task checks the spec against the code. When a check disagrees, correct `specs/list/spec.md`, not the code, and move the behaviour to the Findings in `design.md` if it looks like a defect.

## 1. Check the spec against the existing tests

- [ ] 1.1 Run `yarn run styles:build-all`, then `npx vitest run packages/components/list`, and verify both list unit suites pass on the baseline commit
- [ ] 1.2 Run `yarn run e2e:docker yarn playwright test packages/components/list` and verify the list e2e suite passes. It backs the action button, select-all row, drag preview, drag cursor, drag handle and drag-across-groups requirements
- [ ] 1.3 For each requirement in `specs/list/spec.md`, name at least one unit or e2e test that asserts it, or a test in `packages/components/core` for the mode parser. Verify that every requirement or part without such a test is listed under "Behaviour without a test" in `design.md`

## 2. Check code-only behaviour in the dev app

`yarn run dev:list` exists in `package.json`. Run each check there (http://localhost:3003), using the playgrounds and the docs examples embedded in the page.

- [ ] 2.1 Verify the click rules:
    - in the "Multiple selection: Keyboard" list, a plain click on an option leaves only that option selected;
    - a click on the option that is already selected logs `onSelectionChange` again;
    - `Ctrl`+click adds an option, and `Ctrl`+click on the only selected option of a single-selection list is ignored
- [ ] 2.2 Verify the checkbox overrides:
    - in the "single selection" list, the option with `[showCheckbox]="true"` renders a pseudo-checkbox;
    - in the "Multiple selection with mixed state" example, the projected pseudo-checkbox replaces the built-in one
- [ ] 2.3 Verify the value and forms details:
    - in the "Multiple selection: Checkbox" list, selecting the last option and then the first gives a value in option order;
    - in the compareWith playground, reloading the data keeps the selection;
    - `selectAll()` and `deselectAll()`, called from the browser console on the instance `ng.getComponent` returns for the "Multiple selection: Checkbox" list, change the bound value and log no `onSelectionChange`
- [ ] 2.4 Verify these classes in the DOM:
    - a disabled list has `kbq-disabled` on its host;
    - options of a multiple-mode list have `kbq-list-option_multiple`
- [ ] 2.5 Verify in the "list-groups" example:
    - a group is exposed as `role="group"` named by its label;
    - the arrow keys skip the options of the disabled group
- [ ] 2.6 Verify the keyboard details:
    - `Down` on the last option and `Up` on the first do not wrap;
    - typing a letter in the "single selection" list moves focus to the next option starting with it without selecting it, and wraps to the start of the list;
    - with `noUnselectLast` on, `Space` on the only selected option does not deselect it;
    - `Ctrl`+`A` and `Ctrl`+`C` have their default action prevented, and `Ctrl`+`C` keeps it with an `(onCopy)` handler bound
- [ ] 2.7 Verify the action button: `Shift`+`Tab` from a focused action returns focus to its option
- [ ] 2.8 Verify these select-all row details:
    - typing the first letter of its label does not land on the row;
    - with a `selectAllHandler` bound, a click on the row still toggles every enabled option
- [ ] 2.9 Verify the drag details in the "draggable" playgrounds:
    - the drop indicator has `aria-hidden="true"`;
    - an option moved into the connected list arrives unselected
- [ ] 2.10 Verify that no `kbq-list-selection` in the page has an `aria-label` or `aria-labelledby` the consumer did not set
- [ ] 2.11 The dev app has no list connected by `id`. Verify by reading `onOptionDragMoved` and `clearDropIndicators` in `list-selection.component.ts` that the drop indicator is drawn only in lists passed to `connectedTo` as instances

## 3. Final checks

- [ ] 3.1 Run `openspec validate document-list-baseline --strict` and verify it reports the change as valid
- [ ] 3.2 Run `git status --short` and verify that nothing outside `openspec/` has changed

## Workflow follow-up

- Archive with `/opsx:archive document-list-baseline` once the checks pass. This creates `openspec/specs/list/spec.md`.
- Decide which Findings in `design.md` become changes of their own. The selection lost under virtual scrolling and the `selectionChange` fired by `Ctrl`/`Cmd` with an arrow key are the most user-visible ones.
