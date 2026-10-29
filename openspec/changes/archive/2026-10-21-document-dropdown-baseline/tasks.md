# Tasks

No source, test or docs file changes in this change. Every task checks the spec against the code. When a check disagrees, correct `specs/dropdown/spec.md`, not the code, and move the behaviour to the Findings in `design.md` if it looks like a defect.

## 1. Check the spec against the existing tests

- [ ] 1.1 Run `yarn run styles:build-all`, then `npx vitest run packages/components/dropdown`, and verify that `dropdown.spec.ts` and `dropdown-item.spec.ts` pass on the baseline commit
- [ ] 1.2 Run `yarn run e2e:docker yarn playwright test packages/components/dropdown` and verify that both Playwright files pass: the Chrome suite backs the nested panel offsets, the safe-area background, the scrollbar, the 150 px panel width and the truncated-item tooltips, and the WebKit file backs hovering a partially clipped row
- [ ] 1.3 For each requirement in `specs/dropdown/spec.md`, name at least one unit or e2e test that asserts it and that can fail. Verify that every requirement or part of one without such a test is listed under "Behaviour without a test" in `design.md`, counting the tests listed there as unable to fail as no test

## 2. Check code-only behaviour in the dev app

`yarn run dev:dropdown` exists in `package.json`. Run each check in it (http://localhost:3003), using the docs examples embedded there, unless the task names another app.

- [ ] 2.1 Verify opening and closing:
    - a second click on a top-level trigger closes its panel, and Space on a focused trigger toggles it;
    - with `openByArrowDown` unchecked in its example, Down Arrow on the trigger leaves the panel closed;
    - a click elsewhere on the page closes a panel without a backdrop;
    - a click on the "Header" group header of the overview example closes the panel
- [ ] 2.2 Verify focus:
    - after scrolling the list of a scrollable panel and reopening it, the list starts at the top;
    - in the nested example, Escape and Left Arrow in a nested panel opened with Right Arrow return focus to its trigger item;
    - hovering a disabled item does not focus it
- [ ] 2.3 Verify navigation: in the navigation-wrap example Down Arrow on the last enabled item focuses the first one and Up Arrow on the first focuses the last, while in the overview example both keys stop at the ends
- [ ] 2.4 Verify the "Loading item" of the overview example in the DOM: it has `kbq-progress`, `tabindex="0"` and no `aria-disabled`. Record in `design.md` whether a click on it runs nothing and leaves the panel open (suspected defect 3)
- [ ] 2.5 Verify nested panels: Space on a focused nested trigger item opens its panel, and the opened panel has the class `kbq-dropdown__panel_nested`
- [ ] 2.6 Verify the slash-menu example: the arrow keys typed in the editor move `kbq-dropdown-item_active` while the caret stays in the editor, and no element carries `aria-activedescendant`
- [ ] 2.7 Verify position and width:
    - with the trigger near the right or bottom edge of a narrowed window, the panel opens on the other side and its classes say `kbq-dropdown-before` or `kbq-dropdown-above`;
    - the panel of the dev template with `[overlapTriggerX]="false"` opens beside its trigger;
    - the panels of the overview example are at most 200 px wide (`panelMaxWidth`);
    - typing a long value into the lazy-load example's field makes its panel stop growing at 640 px
- [ ] 2.8 Verify in `yarn run dev:app-switcher` that the site rows marked `kbqDropdownStaticContent` render where their `kbq-dropdown` element stands and not in an overlay panel

## 3. Final checks

- [ ] 3.1 Run `openspec validate document-dropdown-baseline --strict` and verify it reports the change as valid
- [ ] 3.2 Run `git status --short` and verify that nothing outside `openspec/` has changed

## Workflow follow-up

- Archive with `/opsx:archive document-dropdown-baseline` once the checks pass. This creates `openspec/specs/dropdown/spec.md`.
- Decide which Findings in `design.md` become changes of their own. The crash of a partial `KBQ_DROPDOWN_DEFAULT_OPTIONS` and the explicit `panelWidth` ignored on nested panels are the most user-visible ones.
