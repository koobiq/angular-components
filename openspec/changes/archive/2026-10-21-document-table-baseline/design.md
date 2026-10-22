# Design

## Context

See proposal.md for why. The spec describes `main` at `c9c196a9b`. Its sources are:

- `packages/components/table/`: the component, the module, `table.scss`, `table-tokens.scss` and `_table-theme.scss` (most of the behaviour is in the styles), the unit spec, `e2e.ts`, the Playwright spec and its screenshot baseline `01-light.png`;
- the `table.{en,ru}.mdx` and `examples.table.{en,ru}.mdx` pages, the five examples under `packages/docs-examples/components/table/` and the `table` entry of `apps/docs/src/app/structure.ts`;
- the API golden file `tools/public_api_guard/components/table.api.md`;
- `kbqGetElementHeight` and the rounded-corner mixin from `packages/components/core`;
- the Table section of `docs/guides/migration.en.mdx` and the `table-cell-content` migration, which describe the last review of the component.

Every claim in the spec was checked against the source; the visual ones also against the screenshot baseline. `openspec/specs/` holds the `select` baseline, whose pattern this change follows.

## Goals / Non-Goals

**Goals:**

- A contract a consumer can rely on: every requirement is observable from outside the component, and every scenario can be checked by an existing test or by hand in the dev app or the e2e app.
- One place to diff against when table behaviour changes later.

**Non-Goals:**

- Fixing anything found along the way (see Findings).
- Colors, sizes, radii, font levels and the `--kbq-table-*` tokens a consumer does not set.
- The controls placed in cells, `kbq-skeleton` table rows, and the removed `KbqTableCellContent`.
- Changes to tests, docs or examples.

## Decisions

1. **The general decisions follow the select baseline**: one capability, `table`, at a flat path that matches the entry point; English; the spec describes what ships, quirks included; only behaviour confirmed by a test or read directly in the source goes in; public names, selectors, host classes, ARIA and thrown errors count as contract, internal names do not. The table has no outputs, methods, ARIA text, locale strings or thrown errors, so those parts are empty here.
2. **For a styling layer, the contract is which parts each option touches.** `KbqTable` has three inputs and one measurement; the rest is CSS. The spec states which rows get a line, which rows highlight, which cells stick, which cells get the compact padding, how alignment follows the text direction and which elements get the scroll margin. It does not state the colors, paddings, radii or font levels behind them: those belong to the design tokens. Alternative considered: leaving the CSS out entirely as styling. Rejected, because it would leave three inputs and a header height with no observable effect.
3. **Custom properties count only where a consumer sets or reads them.** These are in:
    - `--kbq-table-sticky-header-background`, which the docs page tells consumers to set;
    - `--kbq-table-cell-text-align`, which the migration guide names as the alignment switch;
    - `--kbq-table-size-sticky-header-height`, which the table writes on its element and the unit tests read.

    The color and size tokens the migration guide lists are not part of the spec.

4. **The `kbq-hovered` row class is contract.** The styles treat it exactly like pointer hover, the screenshot test depends on it, and it is the library-wide class for a forced hover state (links, options and the file upload use it too). A consumer can use it to highlight a row from code.
5. **The screenshot baseline counts as a test for visual requirements.** One Playwright screenshot of thirteen tables backs the wrapping, header line, button cell, `border`, hover, rounded ends, `disableHover`, pinned header, header background and right-to-left requirements. Each is named against that screenshot in tasks 1.3.
6. **The absence of a cell directive is stated.** "Cells are left untouched" has a unit test, written after a directive with the selector `kbq-table td` attached itself to every cell of every template that imported the module. Keeping it in the spec makes a change that brings a cell directive back a `MODIFIED` delta.

## Risks / Trade-offs

- [The spec drifts from the code] → A change to `packages/components/table` updates `openspec/specs/table/spec.md` with a delta. Reviewers check it the same way they check the API golden file and the screenshot baseline.
- [Most requirements rest on one screenshot] → A failing screenshot does not say which requirement broke. tasks 1.3 maps each visual requirement to the table in `E2eTableStates` that shows it.
- [Some requirements rest on the source rather than on a test] → tasks.md checks each of them by hand before archiving. A mismatch is corrected in the delta, not in the code.
- [The compact padding of a button cell needs `:has()`, and the rounded ends prefer `corner-shape`] → In a browser without `:has()` the cell keeps its full padding; without `corner-shape` the corners are plain circular arcs. The spec states the behaviour of the browsers the screenshots run in and leaves the corner shape to styling.
- [A defect gets recorded as intended behaviour] → Suspected defects stay out of the spec and are listed under Findings. Behaviour the spec does state can change later through `MODIFIED`.

## Findings

These are recorded, not fixed, in this change. Each can become a change of its own.

**Docs and JSDoc that disagree with the code**

1. `table.en.mdx` and `table.ru.mdx` say `border` draws a line "under every row". The line is drawn under body rows only: footer rows get none, and the header line is drawn whether or not `border` is set. The JSDoc of `border` correctly says "every body row".
2. The sticky header section shows `--kbq-table-sticky-header-background: var(--kbq-background-card);` without a selector and tells consumers to "point the token at that surface". The table defines the property on its own element, so a value set on the card, the modal or the side panel has no effect; it has to be set on the table, as the e2e scenario does inline. The same holds for `--kbq-table-cell-text-align` and every other `--kbq-table-*` token in the migration guide.
3. The docs say the table accounts for the header height on "the controls inside" its cells, and the JSDoc of the published height says "body cells". The scroll margin covers `a`, `button`, `input`, `select`, `textarea`, `summary` and `[tabindex]` in body and footer cells. A `[contenteditable]` element, an `iframe` or a media element with `controls` can still be scrolled under the header.
4. The JSDoc of `stickyHeader` says the header stays visible "while the table scrolls". The table does not scroll; the `th` cells stick to the nearest scrolling ancestor, and `td` cells in the header do not stick.
5. `examples.table.en.mdx` and `examples.table.ru.mdx` are "documentation in progress" placeholders. `structure.ts` sets `hasExamples: false`, so they are never routed, while all five examples already appear on the overview page.
6. The example titled "Table full width" illustrates the sentence about wrapping text. The full width comes from the example's own `style="width: 100%"`; the component sets no width.

**Suspected defects (from reading the code, not reproduced)**

1. A `<thead>` with more than one row: every header `th` sticks at `top: 0`, so when the header is pinned the second row slides over the first instead of staying below it. The published height covers the whole `<thead>`, so the scroll margin is right while the header itself overlaps.
2. A `td` in the `<thead>`, such as an empty corner cell, gets no header line, does not stick and has no background. With `stickyHeader`, body rows show through that cell.
3. A `<thead>` added to, or replaced in, a table that is already rendered is not observed while `stickyHeader` stays on. The height stays unset, or at the last size reported for the old element, so a focused control can land under the header. A source comment says swapping the `<thead>` is not supported; the docs do not mention it.
4. The compact padding matches a `kbq-button` anywhere in a cell. A cell that holds wrapped text and a small button loses the full block padding around the text too.

**Tests whose name and body disagree, or that cannot fail**

- "should not attach anything to cells, inside or outside a kbq-table" checks only class names. The regression its comment describes — a directive instance and a content query on every cell — would pass it as long as the directive adds no class.
- "should have no axe violations" renders two tables without a `<thead>`, header cells or a pinned header, so the header-related axe rules have nothing to check.

**Behaviour without a test.** The spec states these from the source:

- the `kbq-table` attribute on an element other than `<table>` creating nothing;
- the standalone import of `KbqTable` (the unit spec and the e2e app import `KbqTableModule`);
- the `kbqTable` template reference;
- no `role`, `aria-*` or `tabindex` on the table, and Tab skipping the table itself;
- the removal of `kbq-table_bordered` and `kbq-table_sticky-header` when their option turns off (only `disableHover` is tested);
- the table's width following its content (every table in the e2e scenario has `width: 100%`);
- `--kbq-table-cell-text-align` set by a consumer;
- the compact padding in a footer cell;
- real pointer hover, on body, header and footer rows and under `disableHover` (the screenshot uses the `kbq-hovered` class);
- the square bottom corners of the last body row before a `<tfoot>` (the one footer table in the screenshot has `border`);
- the pinned header keeping the page background when the token is set only on an ancestor;
- a second size report updating the published height;
- no height without a `<thead>` or during server rendering;
- the scroll margin of footer cells and of focusable elements other than a button.
