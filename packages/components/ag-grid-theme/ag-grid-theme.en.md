[AG Grid](https://www.ag-grid.com/archive/30.2.0/angular-data-grid/) is designed for working with large tables, the component supports sorting, virtual scrolling, resizing, reordering columns, and more.

<!-- example(ag-grid-theme-overview) -->

### Theme installation and usage

<div class="kbq-callout kbq-callout_theme">
<div class="kbq-callout__header">Note</div>
<div class="kbq-callout__content kbq-docs-element-last-child-margin-bottom-0">

This theme is designed to work with AG Grid [version 30](https://github.com/ag-grid/ag-grid/tree/v30.2.1).

```bash
npm install @koobiq/ag-grid-angular-theme@^30 ag-grid-community@^30 ag-grid-angular@^30
```

</div>
</div>

### Usage

Setup your main `styles.scss` file:

```scss
// Import theme
// https://github.com/koobiq/data-grid/blob/main/packages/ag-grid-angular-theme/README.md
@use '@koobiq/ag-grid-angular-theme';

// Import @koobiq/icons
// https://github.com/koobiq/icons
@use '@koobiq/icons/fonts/kbq-icons';

// Import @koobiq/design-tokens
// https://github.com/koobiq/design-tokens
@use '@koobiq/design-tokens/web/css-tokens';
@use '@koobiq/design-tokens/web/css-tokens-light';
@use '@koobiq/design-tokens/web/css-tokens-dark';

// Import Inter font
// https://koobiq.io/en/main/typography/overview#installing-fonts
@import '@fontsource/inter/400.css';
@import '@fontsource/inter/500.css';
@import '@fontsource/inter/600.css';
@import '@fontsource/inter/700.css';
@import '@fontsource/inter/400-italic.css';
@import '@fontsource/inter/500-italic.css';
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

-   Use the [Table](/en/components/table) component for simple tables with small amounts of data where resizing and reordering columns are not needed.
-   If the list contains only one column, use [`List`](/en/components/list) or [`Tree`](/en/components/tree) instead.
