# Tasks

No source, test or docs file changes in this change. Every task checks the spec against the code. When a check disagrees, correct `specs/filter-bar/spec.md`, not the code, and move the behaviour to the Findings in `design.md` if it looks like a defect.

## 1. Check the spec against the existing tests

- [ ] 1.1 Run `yarn run styles:build-all`, then `npx vitest run packages/components/filter-bar`, and verify the filter-bar unit suites (the bar, `kbq-filters`, `kbq-pipe-add`, `kbq-filter-reset`, `kbqPipeState` and every pipe) pass on the baseline commit
- [ ] 1.2 Run `yarn run e2e:docker yarn playwright test packages/components/filter-bar` and verify the filter-bar e2e suite passes. It backs the trigger layout and width, panel height, caption and wrapping, fill state, empty-options and date-without-presets requirements
- [ ] 1.3 For each requirement in `specs/filter-bar/spec.md`, name at least one unit or e2e test that asserts it. Verify that every requirement, or part of one, without such a test is listed under "Behaviour without a test" in `design.md`

## 2. Check code-only behaviour in the dev app

`yarn run dev:filter-bar` exists in `package.json`. Run it (http://localhost:3003) and use the bar at the top, whose filter is printed as JSON below it, and the docs examples embedded under it.

- [ ] 2.1 Verify the bar and its model:
    - `kbq-filters`, the pipes, `kbq-pipe-add` and `kbq-filter-reset` appear in that order whatever their order in `template.html`;
    - after a pipe value is changed and then set back, the JSON still shows `"changed": true`
- [ ] 2.2 Verify pipe rendering:
    - an open pipe trigger carries `kbq-active` in the DOM;
    - a pipe added from `kbq-pipe-add` opens once, and the JSON shows no `openOnAdd` on it afterwards;
    - closing a multi-select panel by clicking another button leaves focus on that button
- [ ] 2.3 Verify the clear and remove buttons:
    - their `aria-label` and tooltip are the locale's clear or delete text;
    - the remove button of a removable pipe removes it;
    - the buttons of the "Inactive filter" example are disabled;
    - a pipe with both `cleanable` and `removable` clears instead of leaving and keeps its button while empty
- [ ] 2.4 Verify the add and reset controls:
    - the add button has the `aria-label` and tooltip "Добавить фильтр" under the default locale;
    - the reset button shows its projected content when there is some;
    - in the overview example, Reset opens the Datetime pipe that carries `openOnReset`
- [ ] 2.5 Verify the pipe types:
    - in the "Unchangeable filters" example, the readonly pipe opens nothing and its remove button removes it;
    - the text pipe's Apply shows "Ctrl + Enter" (or "⌘ Enter" on macOS), and its textarea stops growing at five rows;
    - in an input pipe, typing and pressing Enter at once leaves the JSON unchanged until 200 ms have passed;
    - a removable input pipe shows no remove button, and retyping the stored text emits no `onChangePipe` in the console
- [ ] 2.6 Verify the multi pipes:
    - a multi-select pipe shows the option name with one value and a count badge with several;
    - checking every child of a multi-tree-select branch checks the branch;
    - in the "Select all" example, the select-all row disappears while the search finds nothing
- [ ] 2.7 Verify pipe search:
    - in a select pipe with search, "2 option" finds "Option 2";
    - a tree pipe highlights the match;
    - a query that matches nothing shows "Ничего не найдено" under the default locale
- [ ] 2.8 Verify saved filters:
    - the filters trigger is disabled while a save is pending;
    - the current filter is marked `kbq-selected` in the menu;
    - with an empty `filters` list only "Save as new filter" is shown;
    - a read-only saved filter's actions menu offers only "Save as new" (and "Reset" once changed);
    - the name field of the save popover gets focus when it opens;
    - after "Save as new", the JSON keeps the old filter until the application applies the saved one;
    - after Delete, focus is on the filters trigger;
    - the dev app's `onChangeFilter` handler never runs
- [ ] 2.9 Verify state saving in the "State saving" example: change a pipe of the default (unnamed) filter, reload the page, and check that the change is restored. A key change and a bar outside the document cannot be produced in the dev app: check them by reading `restoreState()` and `persists` in `filter-bar.ts` and the `keyChanges` tests in `core/state-saving/state-saving.spec.ts`
- [ ] 2.10 Verify in the DOM that the add, save-as-new, actions, clear and remove buttons and the search fields of the pipes and of the saved-filter menu carry the `aria-label` the spec names
- [ ] 2.11 No example binds `[localeOverrides]` on the bar or renders `kbq-filter-refresher`. Check the first through `core/locales/locale-overrides.directive.spec.ts` and the bar's `hostDirectives`, and the second by reading `filter-refresher.ts`; keep both under "Behaviour without a test"

## 3. Final checks

- [ ] 3.1 Run `openspec validate document-filter-bar-baseline --strict` and verify it reports the change as valid
- [ ] 3.2 Run `git status --short` and verify that nothing outside `openspec/` has changed

## Workflow follow-up

- Archive with `/opsx:archive document-filter-bar-baseline` once the checks pass. This creates `openspec/specs/filter-bar/spec.md`.
- Decide which Findings in `design.md` become changes of their own. The `input` pipe docs (Enter, blur and the three-character threshold) and the latched `openOnReset` are the most user-visible ones.
