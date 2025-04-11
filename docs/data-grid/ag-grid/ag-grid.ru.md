[AG Grid](https://www.ag-grid.com/archive/30.2.0/angular-data-grid/) предназначен для работы с большими таблицами, компонент поддерживает сортировку, виртуальную прокрутку, изменение ширины и порядка колонок и тд.

<!-- example(ag-grid-overview) -->

### Стилизация

Для стилизации AG Grid используется тема [`@koobiq/ag-grid-angular-theme`](https://github.com/koobiq/data-grid/blob/main/packages/ag-grid-angular-theme/README.md), она предоставляет готовые стили, которые упрощают настройку внешнего вида таблицы.

#### Установка

<div class="kbq-callout kbq-callout_theme">
<div class="kbq-callout__header">Обратите внимание</div>
<div class="kbq-callout__content kbq-docs-element-last-child-margin-bottom-0">

Данная тема разработана для работы с AG Grid [версии 30](https://github.com/ag-grid/ag-grid/tree/v30.2.1).

```bash
npm install @koobiq/ag-grid-angular-theme@^30 ag-grid-community@^30 ag-grid-angular@^30
```

</div>
</div>

#### Подключение

Импортируйте тему в ваш основной `styles.scss` файл:

```scss
@use '@koobiq/ag-grid-angular-theme';
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

-   Используйте компонент [`Table`](/ru/components/table) для простых таблиц, где мало данных и не нужно менять ширину и порядок колонок.
-   Если в списке всего одна колонка, то используйте [`List`](/ru/components/list) или [`Tree`](/ru/components/tree).
