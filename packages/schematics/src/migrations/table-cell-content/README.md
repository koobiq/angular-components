# table-cell-content

Migration schematic invoked automatically by `ng update @koobiq/components@20`
(registered for `21.0.0-0`). Reports the removal of `KbqTableCellContent` and the style-surface changes
the table review made. It never writes to the tree.

## Background

`KbqTableCellContent` was declared `selector: 'kbq-table td'`. Angular's directive selector grammar has
element names, attributes, classes and `:not(…)` — and no combinators. Its parser calls `setElement()`
for every bare tag it meets, so the second tag overwrote the first and the effective selector was `td`.
Two things followed. Every template that imported `KbqTableModule` got a directive instance plus a live
content query on **every** cell it rendered, whether or not the table was a `kbq-table`. And the
`kbq-table` element the selector named has never existed: the component is an attribute on a native
`<table>`.

The one rule the directive fed — a cell holding a button keeps the row at the button's own height — is
CSS now:

```scss
.kbq-table > tbody > tr > :is(td, th):has(.kbq-button, .kbq-button-icon) {
    padding-block: var(--kbq-size-xxs);
}
```

That also drops the `@koobiq/components/button` dependency from the table entry point.

| Pattern                     | Manual migration                                                                    |
| --------------------------- | ----------------------------------------------------------------------------------- |
| `KbqTableCellContent`       | Delete it from the `imports` array; nothing replaces it                             |
| `kbq-table-cell_has-button` | Select the cell: `:is(td, th):has(.kbq-button, .kbq-button-icon)`                   |
| `--kbq-background-bg`       | A pinned header defaults to `--kbq-background-card`; re-pin it with the token below |

## What else changed

- Row hover and the pill corner radii cover `<th>` inside `<tbody>` as well as `<td>`, so a row led by a
  row header is highlighted and rounded as a unit. A consumer rule that switched the highlight off per
  row (`tr:hover { background: none }`) used to be a no-op against the cell-level color — bind
  `[disableHover]` or set `--kbq-table-states-hover-background: transparent`.
- Every color is behind a `--kbq-table-*` token: `--kbq-table-header-text`, `--kbq-table-body-text`,
  `--kbq-table-border-color`, `--kbq-table-states-hover-background` and
  `--kbq-table-sticky-header-background`, which defaults to `--kbq-background-card` rather than
  `--kbq-background-bg`. The row radius is `--kbq-table-size-row-border-radius`.
- Cell padding and the corner radii are logical properties, and alignment goes through
  `--kbq-table-cell-text-align` (default `start`), so a table under `dir="rtl"` mirrors.
- `<tfoot>` gets the library color and typography it was already being padded for.
- A pinned header publishes its measured height as `--kbq-table-size-sticky-header-height`, used as
  `scroll-margin-block-start` on the cells and their focusable content so a control scrolled to the top
  edge does not land under the header (WCAG 2.2 SC 2.4.11).

## Running it manually

```
ng generate @koobiq/components:table-cell-content --project my-app
```
