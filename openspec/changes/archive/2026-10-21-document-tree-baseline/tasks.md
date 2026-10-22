# Tasks

No source, test or docs file changes in this change. Every task checks the spec against the code. When a check disagrees, correct `specs/tree/spec.md`, not the code, and move the behaviour to the Findings in `design.md` if it looks like a defect.

## 1. Check the spec against the existing tests

- [ ] 1.1 Run `yarn run styles:build-all`, then `npx vitest run packages/components/tree`, and verify the tree unit suites pass on the baseline commit (one test, "should not blur on focused option when copying", is skipped on purpose)
- [ ] 1.2 Run `yarn run e2e:docker yarn playwright test packages/components/tree` and verify the tree e2e suite passes. It backs the option action requirements and the keyboard entry into the tree
- [ ] 1.3 For each requirement in `specs/tree/spec.md`, name at least one unit or e2e test that asserts it. Verify that every requirement or part of one without such a test is listed under "Behaviour without a test" in `design.md`

## 2. Check code-only behaviour by hand

The script `dev:tree` exists in `package.json`. Run each check in `yarn run dev:tree` (http://localhost:3003), using the tree with the mode buttons and the docs examples embedded there.

- [ ] 2.1 Verify the keyboard in the tree with the mode buttons:
    - PageDown and PageUp move by a page and stop at the last and first row;
    - in `checkbox` mode, and with Ctrl/Cmd held in the other modes, Up and Down move without changing the value;
    - Ctrl+A does nothing in single selection;
    - after Ctrl-clicking `Documents` and then `Pictures` in `keyboard` mode, the printed `ngModel` lists `Documents` first
- [ ] 2.2 Verify the classes and the tab index in the DOM:
    - rows carry `kbq-tree-option_multiple` only in a multiple mode;
    - a search query that matches nothing leaves the tree element with `tabindex="-1"`;
    - with `aria-labelledby` added to the tree element in devtools, the attribute is still there after the next key press
- [ ] 2.3 Verify the toggles:
    - a `kbq-tree-node-toggle` bound with `[node]` gains `kbq-expanded` when its node expands;
    - every toggle carries `disabled` and `aria-disabled="true"` while a search query is typed;
    - in the "Expanding a branch on click" example, clicking a branch row expands it without selecting it
- [ ] 2.4 Verify copying:
    - the tree that binds `(copyChange)` logs the event on Ctrl+C and leaves the clipboard unchanged;
    - in the overview example, which has no listener, Ctrl+C puts the active row's value on the clipboard
- [ ] 2.5 Verify that arrowing through a tree taller than the window scrolls the page so the active row stays visible
- [ ] 2.6 Verify by reading the source, since no dev-app tree triggers them:
    - the four error messages in `tree-errors.ts` are thrown where the spec says, in `tree-base.ts`;
    - the select-all row is rendered only for a non-empty tree in multiple selection;
    - Space and Enter on the select-all row toggle "select all";
    - `[localeOverrides]` reaches the label through the `KbqLocaleOverridesDirective` host directive, which `packages/components/core/locales/locale-overrides.directive.spec.ts` covers

## 3. Final checks

- [ ] 3.1 Run `openspec validate document-tree-baseline --strict` and verify it reports the change as valid
- [ ] 3.2 Run `git status --short` and verify that nothing outside `openspec/` has changed

## Workflow follow-up

- Archive with `/opsx:archive document-tree-baseline` once the checks pass. This creates `openspec/specs/tree/spec.md`.
- Decide which Findings in `design.md` become changes of their own. The swapped and wrong rows of the keyboard table, the inverted `noUnselectLast` JSDoc and the empty query that filters by "null" are the most user-visible ones.
- Coordinate with `document-tree-select-baseline`: behaviour the tree-select inherits from `kbq-tree-selection` belongs here, and a fix to it updates both specs.
