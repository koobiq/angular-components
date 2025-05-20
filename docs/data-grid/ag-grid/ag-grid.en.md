AG Grid is designed for working with large tables. The component supports sorting, virtual scrolling, resizing, and reordering of columns. It is based on the library [ag-grid-angular](https://www.ag-grid.com/archive/30.2.0/angular-data-grid/).

<!-- example(ag-grid-overview) -->

### Table Styling

To maintain a consistent table style across projects, a theme [`@koobiq/ag-grid-angular-theme`](https://github.com/koobiq/data-grid/blob/main/packages/ag-grid-angular-theme/README.md) has been created. It includes ready-to-use styles that align with the design system. The theme supports the core features of AG Grid and simplifies table appearance customization.

#### Installation

<div class="kbq-callout kbq-callout_theme">
<div class="kbq-callout__header">Note</div>
<div class="kbq-callout__content kbq-docs-element-last-child-margin-bottom-0">

The theme is compatible with AG Grid [version 30](https://github.com/ag-grid/ag-grid/tree/v30.2.1).

</div>
</div>

Install the following packages:

```bash
npm install @koobiq/ag-grid-angular-theme@^30 ag-grid-community@^30 ag-grid-angular@^30
```

#### Applying the Theme

Import the theme into the main styles file `styles.scss`:

```scss
@use '@koobiq/ag-grid-angular-theme';
```

Apply the theme to `<ag-grid-angular>` in the template:

```ts
import { KbqAgGridTheme } from '@koobiq/ag-grid-angular-theme';
import { AgGridModule } from 'ag-grid-angular';

@Component({
    imports: [AgGridModule, KbqAgGridTheme],
    template: `<ag-grid-angular kbqAgGridTheme />`
})
```

The full documentation for using the theme is available [in the GitHub repository](https://github.com/koobiq/data-grid/blob/main/packages/ag-grid-angular-theme/README.md).

### Recommendations

- Use the [Table](/en/components/table) component for simple tables with a small amount of data that do not require resizing or reordering of columns.
- If the list contains only one column, use [List](/en/components/list) or [Tree](/en/components/tree).
