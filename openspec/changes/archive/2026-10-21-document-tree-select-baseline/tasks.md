# Tasks

No source, test or docs file changes in this change. Every task checks the spec against the code. When a check disagrees, correct `specs/tree-select/spec.md`, not the code, and move the behaviour to the Findings in `design.md` if it looks like a defect.

## 1. Check the spec against the existing tests

- [ ] 1.1 Run `yarn run styles:build-all`, then `npx vitest run packages/components/tree-select`, and verify the tree-select unit suite passes on the baseline commit
- [ ] 1.2 Run `yarn run e2e:docker yarn playwright test packages/components/tree-select` and verify both Playwright specs pass: `e2e.playwright-spec.ts` in Chrome and `e2e.webkit.playwright-spec.ts` in WebKit. They back the position, width, height, scrollbar, disabled, closed-keyboard and select-all keyboard requirements
- [ ] 1.3 For each requirement in `specs/tree-select/spec.md`, name at least one unit or e2e test that asserts it. Verify that every requirement without such a test is listed under "Behaviour without a test" in `design.md`, and that no test listed there as unable to fail is the only one named for a requirement

## 2. Check code-only behaviour in the dev app

`yarn run dev:tree-select` is defined in `package.json`. Run it (http://localhost:3003). The page renders the dev sections "Custom footer", "Default footer" and "Default footer with icon button", all multiple with search, followed by nine docs examples; `tree-select-height` is the only single tree-select among them. Where a check needs a binding nothing on the page has (`autoSelect`, `hasBackdrop`, `panelMaxWidth`, `localeOverrides`), add it temporarily to `packages/components-dev/tree-select/template.html`; to disable the dev sections, set `disabledState` to `true` in `module.ts`. Revert both before task 3.2.

- [ ] 2.1 Verify the single-selection keyboard model in the `tree-select-height` example:
    - Down and Up in the open panel change the trigger text as they move;
    - Home, End, PageUp and PageDown move the highlight without changing it;
    - Enter right after opening closes the panel without a value;
    - with `[autoSelect]="false"`, Down does not change the value and Enter selects the highlighted node and leaves the panel open
- [ ] 2.2 Verify the keyboard on the closed control and in the tree:
    - typing the first letters of a root node's label on the closed `tree-select-height` example selects that node;
    - Right expands a collapsed branch and then moves to its first child, Left collapses it and moves to the parent;
    - in the "Kept" tree-select of `tree-select-cleaner-with-disabled`, Space toggles the highlighted node and Shift+Down gives the next node the state of the one left
- [ ] 2.3 Verify the search in the "Default footer" section:
    - a query is gone after the panel is closed and reopened;
    - PageDown pressed in the field moves focus onto an option;
    - a query that matches nothing shows the projected empty-result text
- [ ] 2.4 Verify the trigger:
    - in "Default footer", removing a tag with Enter neither opens nor closes the panel;
    - with the dev sections disabled, their tags render without remove controls;
    - the remove control has `aria-hidden="true"` in the DOM, as Finding 1 suspects;
    - the `tree-select-deleted-nodes` example renders its `#kbqSelectTagContent` template once per value
- [ ] 2.5 Verify the footer:
    - the `kbq-select-footer` element in "Default footer" renders below the tree, and a click on it leaves the panel open;
    - "Custom footer", which uses `<div kbq-select-footer>`, renders no footer, as Finding 8 suspects;
    - Tab from inside the panel closes it and moves focus past the tree-select
- [ ] 2.6 Verify the panel:
    - with `hasBackdrop`, a click on the backdrop closes the panel;
    - `panelMaxWidth` stops a content-sized panel from growing past its value;
    - the panel keeps its side while the page is scrolled, and follows the trigger
- [ ] 2.7 Verify in the DOM:
    - the tree in the panel has `role="tree"`, and options have `role="treeitem"`, `aria-level`, `aria-expanded` on branches and `aria-selected` or `aria-checked`;
    - a disabled tree-select has a `disabled` attribute;
    - a multiple tree-select has `kbq-select_multiple`, and the `tree-select-with-multiline-matcher` example has `kbq-select_multiline`;
    - a click on the form field container around a closed tree-select focuses it without opening the panel;
    - `[localeOverrides]` with its own `select.selectAll` changes the select-all label of the `tree-select-select-all` example only

## 3. Final checks

- [ ] 3.1 Run `openspec validate document-tree-select-baseline --strict` and verify it reports the change as valid
- [ ] 3.2 Run `git status --short` and verify that nothing outside `openspec/` has changed

## Workflow follow-up

- Archive with `/opsx:archive document-tree-select-baseline` once the checks pass. This creates `openspec/specs/tree-select/spec.md`.
- Decide which Findings in `design.md` become changes of their own. The footer that is not projected and the remove control hidden by `aria-hidden` are the most user-visible ones; the single-selection keyboard model needs a decision before it is fixed.
