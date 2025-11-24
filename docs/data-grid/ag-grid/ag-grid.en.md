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

To disable the focus styles for table cells, add the `disableCellFocusStyles` attribute to `<ag-grid-angular>`:

```html
<ag-grid-angular kbqAgGridTheme disableCellFocusStyles />
```

### Row dragging

<!-- example(ag-grid-row-dragging) -->

### Custom keyboard shortcuts

You can apply custom keyboard shortcuts by adding the corresponding directives to your `<ag-grid-angular>` component.

| <div style="min-width: 120px;">Key</div>                                                       | Action                     | Directive                         |
| ---------------------------------------------------------------------------------------------- | -------------------------- | --------------------------------- |
| <span class="docs-hot-key-button">Tab</span>                                                   | Move focus to the next row | `kbqAgGridToNextRowByTab`         |
| <span class="docs-hot-key-button">Shift</span> + <span class="docs-hot-key-button">↓↑</span>   | Select multiple rows       | `kbqAgGridSelectRowsByShiftArrow` |
| <span class="docs-hot-key-button">Ctrl</span> + <span class="docs-hot-key-button">A</span>     | Select all rows            | `kbqAgGridSelectAllRowsByCtrlA`   |
| <span class="docs-hot-key-button">Ctrl</span> + <span class="docs-hot-key-button">click</span> | Select row                 | `kbqAgGridSelectRowsByCtrlClick`  |

More information about keyboard shortcuts can be found in the [ag-grid-angular documentation](https://www.ag-grid.com/angular-data-grid/keyboard-navigation/).

### Recommendations

- Use the [Table](/en/components/table) component for simple tables with a small amount of data that do not require resizing or reordering of columns.
- If the list contains only one column, use [List](/en/components/list) or [Tree](/en/components/tree).
