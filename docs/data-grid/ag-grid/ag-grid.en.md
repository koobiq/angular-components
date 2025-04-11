[AG Grid](https://www.ag-grid.com/archive/30.2.0/angular-data-grid/) is designed for working with large tables, the component supports sorting, virtual scrolling, resizing, reordering columns, and more.

<!-- example(ag-grid-overview) -->

### Styling

The [`@koobiq/ag-grid-angular-theme`](https://github.com/koobiq/data-grid/blob/main/packages/ag-grid-angular-theme/README.md) theme is used for styling AG Grid. It provides ready-to-use styles that simplify the customization of the table's appearance.

#### Installation

<div class="kbq-callout kbq-callout_theme">
<div class="kbq-callout__header">Note</div>
<div class="kbq-callout__content kbq-docs-element-last-child-margin-bottom-0">

This theme is designed to work with AG Grid [version 30](https://github.com/ag-grid/ag-grid/tree/v30.2.1).

```bash
npm install @koobiq/ag-grid-angular-theme@^30 ag-grid-community@^30 ag-grid-angular@^30
```

</div>
</div>

#### Integration

Import the theme into your main `styles.scss` file:

```scss
@use '@koobiq/ag-grid-angular-theme';
```

Apply the theme to `<ag-grid-angular>` in your template:

```ts
import { KbqAgGridTheme } from '@koobiq/ag-grid-angular-theme';
import { AgGridModule } from 'ag-grid-angular';

@Component({
    imports: [AgGridModule, KbqAgGridTheme],
    template: `<ag-grid-angular kbqAgGridTheme />`
})
```

For more detailed information, please refer to the [documentation](https://github.com/koobiq/data-grid/blob/main/packages/ag-grid-angular-theme/README.md).

### Recommendations

-   Use the [`Table`](/en/components/table) component for simple tables with small amounts of data where resizing and reordering columns are not needed.
-   If the list contains only one column, use [`List`](/en/components/list) or [`Tree`](/en/components/tree) instead.
