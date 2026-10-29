# Tasks

No source, test or docs file changes in this change. Every task checks the spec against the code. When a check disagrees, correct `specs/table/spec.md`, not the code, and move the behaviour to the Findings in `design.md` if it looks like a defect.

## 1. Check the spec against the existing tests

- [ ] 1.1 Run `yarn run styles:build-all`, then `npx vitest run packages/components/table`, and verify the table unit suite passes on the baseline commit
- [ ] 1.2 Run `yarn run e2e:docker yarn playwright test packages/components/table` and verify both table e2e tests pass: the `states` screenshot backs the visual requirements, and the focus test backs "Focused controls are not hidden under the pinned header"
- [ ] 1.3 For each requirement in `specs/table/spec.md`, name at least one unit test, or the e2e test and the table in `E2eTableStates` that shows it. Verify that every requirement or scenario without such a test is listed under "Behaviour without a test" in `design.md`

## 2. Check code-only behaviour by hand

`yarn run dev:table` (http://localhost:3003) shows the disable-hover and sticky-header examples and two tables with buttons, one with `border`. The footer, row header, right-to-left and card cases are only in the e2e app: run `yarn run dev:e2e` and open http://localhost:4200/E2eTableStates. Overrides are made in the browser's developer tools; no file is edited. What no running page can show without a template change is checked in the source and the API golden file instead.

- [ ] 2.1 Verify in `tools/public_api_guard/components/table.api.md` that the component declaration has the selector `table[kbq-table]`, the export name `kbqTable` and the standalone flag `true`, and that `KbqTableModule` imports and exports `KbqTable`
- [ ] 2.2 Verify in `table.component.ts` and `table.scss`:
    - `kbq-table_bordered` and `kbq-table_sticky-header` are bound the same way as `kbq-table_disable-hover`, whose removal the unit spec tests;
    - the height is set to nothing when `stickyHeader` is off, when the table has no `<thead>` and when the platform is not a browser;
    - the scroll margin rule lists `tfoot` next to `tbody`
- [ ] 2.3 Verify in the DOM of the dev app that the tables have no `role`, `aria-*` or `tabindex` added by the component, and that Tab moves only between the buttons in their cells
- [ ] 2.4 Verify the hover rules with the pointer:
    - hovering a body row highlights every cell of it, with rounded ends except at the top of the first row;
    - hovering a header row, or any row of the disable-hover example, changes nothing;
    - in `E2eTableStates`, hovering the footer row changes nothing
- [ ] 2.5 Verify the layout rules:
    - the default table in the dev app is only as wide as its content;
    - setting `--kbq-table-cell-text-align: end` in the `style` of a table aligns all of its cells to the end;
    - in `E2eTableStates`, after removing the class `kbq-table_bordered` from the footer table and adding `kbq-hovered` to its last body row, that row's highlight is square at the bottom;
    - a `<button class="kbq-button">` added to a footer cell gives that cell the compact padding
- [ ] 2.6 Verify the sticky header rules in the sticky-header example:
    - `--kbq-table-sticky-header-background` set on the scroll container leaves the header on the page background, while the same value set on the table changes it;
    - a `height` added to a header cell updates `--kbq-table-size-sticky-header-height` on the table to the new height;
    - with the container scrolled to the bottom, focusing a body cell given `tabindex="0"`, or an `input` added to a body cell, scrolls it to just below the pinned header
- [ ] 2.7 Run `yarn run docs:build` and verify that the prerendered table overview page contains the sticky-header example's table with the class `kbq-table_sticky-header` and without `--kbq-table-size-sticky-header-height` in its `style`

## 3. Final checks

- [ ] 3.1 Run `openspec validate document-table-baseline --strict` and verify it reports the change as valid
- [ ] 3.2 Run `git status --short` and verify that nothing outside `openspec/` has changed

## Workflow follow-up

- Archive with `/opsx:archive document-table-baseline` once the checks pass. This creates `openspec/specs/table/spec.md`.
- Decide which Findings in `design.md` become changes of their own. The sticky header token that has no effect when set on the surface the docs point to, and the overlap of a multi-row pinned header, are the most user-visible ones.
