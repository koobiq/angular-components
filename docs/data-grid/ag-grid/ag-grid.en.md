AG Grid is designed for working with large tables. The component supports sorting, virtual scrolling, resizing, and reordering of columns. It is based on the library [ag-grid-angular](https://www.ag-grid.com/angular-data-grid/).

<!-- example(ag-grid-overview) -->

### Table styling

To maintain a consistent table style across projects, a theme [`@koobiq/ag-grid-angular-theme`](https://github.com/koobiq/data-grid/blob/main/packages/ag-grid-angular-theme/README.md) has been created. It includes ready-to-use styles that align with the design system. The theme supports the core features of AG Grid and simplifies table appearance customization.

#### Installation

Install the following packages:

```bash
npm install @koobiq/ag-grid-angular-theme@^34 ag-grid-community@^34 ag-grid-angular@^34
```

#### Applying the theme

Import the theme into the main styles file `styles.scss`:

```scss
@use '@koobiq/ag-grid-angular-theme';
```

Apply the theme to `<ag-grid-angular>` in the template:

```ts
import { KbqAgGridThemeModule } from '@koobiq/ag-grid-angular-theme';
import { AgGridModule } from 'ag-grid-angular';

@Component({
    imports: [AgGridModule, KbqAgGridThemeModule],
    template: `<ag-grid-angular kbqAgGridTheme />`
})
```

The full documentation for using the theme is available [in the GitHub repository](https://github.com/koobiq/data-grid/blob/main/packages/ag-grid-angular-theme/README.md).

### Disabling cell focus styles

To disable the focus styles for table cells, add the `kbqAgGridThemeDisableCellFocusStyles` attribute to `<ag-grid-angular>`:

```html
<ag-grid-angular kbqAgGridTheme kbqAgGridThemeDisableCellFocusStyles />
```

### Row dragging

<!-- example(ag-grid-row-dragging) -->

### Row actions

The `kbqAgGridRowActions` directive adds an action panel that appears when hovering over a row.

<!-- example(ag-grid-row-actions) -->

### Row grouping

The `kbqAgGridRowGroup` directive implements client-side row grouping. Attach it to `ag-grid-angular`, supply raw data via `[kbqAgGridRowGroupRowData]` instead of `[rowData]`, and set the grouped columns via `[(kbqAgGridRowGroupCols)]`.

Collapsed/expanded group state and row selection can each be persisted independently by setting `kbqAgGridRowGroupCollapsedState` and `kbqAgGridRowGroupSelectionState` to a unique key, connecting store providers via `kbqAgGridRowGroupCollapsedStateStoreProvider` and `kbqAgGridRowGroupSelectionStateStoreProvider`.

<!-- example(ag-grid-row-group) -->

### Copying selected rows

The `kbqAgGridCopyByCtrlC` directive allows you to copy selected rows to the clipboard using the `Ctrl+C` keyboard shortcut.

<!-- example(ag-grid-copy-selected) -->

### Export

The grid's own API can be used to export the currently displayed data (respecting active filters, sorting, and formatters). `api.exportDataAsCsv()` downloads a CSV file with no additional dependencies. Other formats can be built on top of the grid's cell values using third-party libraries — for example, XLSX via [`xlsx`](https://www.npmjs.com/package/xlsx), and PDF via [`jspdf`](https://www.npmjs.com/package/jspdf) with [`jspdf-autotable`](https://www.npmjs.com/package/jspdf-autotable).

<!-- example(ag-grid-export) -->

### Status bar

The `kbqAgGridStatusBar` directive adds a customizable panel below the table.

<!-- example(ag-grid-status-bar) -->

### State persistence

Directives save and restore grid state across page reloads.

`LocalStorageStore` is used by default. Switch to `QueryParamsStore` if needed.

#### Columns

The `kbqAgGridColumnState` directive saves sort order, column order, visibility, and width. Add it with a unique key and connect the store provider via `kbqAgGridColumnStateStoreProvider`.

<!-- example(ag-grid-column-state) -->

#### Filters

The `kbqAgGridFilterState` directive saves column filter models. Add it with a unique key and connect the store provider via `kbqAgGridFilterStateStoreProvider`.

<!-- example(ag-grid-filter-state) -->

#### Quick filter

The `kbqAgGridQuickFilterState` directive saves the quick filter value. Add it with a unique key, connect the store provider via `kbqAgGridQuickFilterStateStoreProvider`, and bind the input value via `[(kbqAgGridQuickFilterStateValue)]`.

<!-- example(ag-grid-quick-filter-state) -->

#### External filter

The `kbqAgGridExternalFilterState` directive saves the external filter value. Add it with a unique key, connect the store provider via `kbqAgGridExternalFilterStateStoreProvider`, bind the value via `[(kbqAgGridExternalFilterStateValue)]`, and pass the row check function via `kbqAgGridExternalFilterStatePass`.

<!-- example(ag-grid-external-filter-state) -->

#### Rows

The `kbqAgGridRowSelectionState` directive saves row selection. Add it with a unique key, connect the store provider via `kbqAgGridRowSelectionStateStoreProvider`, and set `getRowId`.

<!-- example(ag-grid-row-selection-state) -->

#### Focus

The `kbqAgGridRowFocusState` directive saves the focused cell. Add it with a unique key, connect the store provider via `kbqAgGridRowFocusStateStoreProvider`, and set `getRowId`.

<!-- example(ag-grid-row-focus-state) -->

### Column menu

The `kbqAgGridColumnMenu` directive adds a button in the top-right corner of the grid that opens a column management menu. The menu allows showing and hiding columns, reordering them via drag-and-drop, pinning them to the left or right, and searching for a column by name. The reset button restores columns to their initial state.

Constraints are configured via `ColDef`:

- `lockVisible: true` prevents hiding a column. The last visible column can never be hidden regardless.
- `lockPinned: true` prevents pinning and unpinning a column.

Russian labels are used by default. To switch the language, provide a labels provider:

```ts
providers: [kbqAgGridColumnMenuLabelsProvider(KBQ_AG_GRID_COLUMN_MENU_LABELS_EN)];
```

<!-- example(ag-grid-column-menu) -->

### Loading overlay

The `kbqAgGridLoadingOverlay` directive controls the grid loading state: when the value is `true`, a skeleton overlay is shown on top of the rows. The number of skeleton rows and columns is configured via `kbqAgGridLoadingOverlayConfigProvider`.

<!-- example(ag-grid-loading-overlay) -->

### Skeleton cell renderer

`KbqAgGridSkeletonCellRenderer` is used together with the infinite row model (`rowModelType="infinite"`). While a data block is not yet loaded (`params.data === undefined`), cells display skeleton placeholders.

<!-- example(ag-grid-skeleton-cell-renderer) -->

### Row selection with infinite scrolling

With infinite scrolling, data is loaded in blocks, so it is not possible to select all rows using a regular list — most of them are not yet loaded. The `kbqAgGridInfiniteSelection` directive inverts the selection: instead of a list of selected rows, it stores an "all selected" flag and a list of exceptions.

This state mirrors the condition "all except the specified IDs", so it can be passed to the server without loading all rows.

The directive requires two parameters:

- `kbqAgGridInfiniteSelectionDatasource` accepts a data source. When all rows are selected, newly loaded blocks are automatically added to the selection.
- `getRowId` returns a stable unique row identifier.

<!-- example(ag-grid-infinite-selection) -->

### Custom keyboard shortcuts

You can add custom keyboard shortcuts by adding the appropriate directives to your `<ag-grid-angular>` component.

| <div style="min-width: 120px;">Key</div>                                                        | Action                 | Directive                         |
| ----------------------------------------------------------------------------------------------- | ---------------------- | --------------------------------- |
| <span class="docs-hot-key-button">Tab</span>                                                    | Move to next row       | `kbqAgGridToNextRowByTab`         |
| <span class="docs-hot-key-button">Shift</span> + <span class="docs-hot-key-button">↓↑</span>    | Select multiple rows   | `kbqAgGridSelectRowsByShiftArrow` |
| <span class="docs-hot-key-button">Ctrl</span> + <span class="docs-hot-key-button">click</span>  | Select a row           | `kbqAgGridSelectRowsByCtrlClick`  |
| <span class="docs-hot-key-button">Ctrl</span> + <span class="docs-hot-key-button">C</span>      | Copy selected rows     | `kbqAgGridCopyByCtrlC`            |
| <span class="docs-hot-key-button">Shift</span> + <span class="docs-hot-key-button">click</span> | Select a range of rows | `kbqAgGridSelectRowsByShiftClick` |
| <span class="docs-hot-key-button">Ctrl</span> + <span class="docs-hot-key-button">A</span>      | Select all rows        | `kbqAgGridInfiniteSelection`      |

More information about keyboard shortcuts can be found in the [ag-grid-angular documentation](https://www.ag-grid.com/angular-data-grid/keyboard-navigation/).

### Recommendations

- Use the [Table](/en/components/table) component for simple tables with a small amount of data that do not require resizing or reordering of columns.
- If the list contains only one column, use [List](/en/components/list) or [Tree](/en/components/tree).
