[AG Grid](https://www.ag-grid.com/archive/30.2.0/angular-data-grid/) предназначен для работы с большими таблицами, компонент поддерживает сортировку, виртуальную прокрутку, изменение ширины и порядка колонок и тд.

<!-- example(ag-grid-theme-overview) -->

### Установка и подключение темы

<div class="kbq-callout kbq-callout_theme">
<div class="kbq-callout__header">Обрати внимание</div>
<div class="kbq-callout__content kbq-docs-element-last-child-margin-bottom-0">

Данная тема разработана для работы с AG Grid [версии 30](https://github.com/ag-grid/ag-grid/tree/v30.2.1).

```bash
npm install @koobiq/ag-grid-angular-theme@^30 ag-grid-community@^30 ag-grid-angular@^30
```

</div>
</div>

### Подключение

Настройте ваш основной `styles.scss` файл:

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

Примените тему для `<ag-grid-angular>` в вашем шаблоне:

```ts
import { KbqAgGridTheme } from '@koobiq/ag-grid-angular-theme';
import { AgGridModule } from 'ag-grid-angular';

@Component({
    imports: [AgGridModule, KbqAgGridTheme],
    template: `<ag-grid-angular kbqAgGridTheme />`
})
```

Для получения более подробной информации, пожалуйста, ознакомьтесь с [документацией](https://github.com/koobiq/data-grid/blob/main/packages/ag-grid-angular-theme/README.md).

### Рекомендации

-   Используйте компонент [Table](/ru/components/table) для простых таблиц, где мало данных и не нужно менять ширину и порядок колонок.
-   Если в списке всего одна колонка, то используйте [`List`](/ru/components/list) или [`Tree`](/ru/components/tree).
