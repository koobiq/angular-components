AG grid предназначен для работы с большими таблицами. Компонент поддерживает сортировку, виртуальную прокрутку, изменение ширины и порядка колонок. Основан на библиотеке [ag-grid-angular](https://www.ag-grid.com/archive/30.2.0/angular-data-grid/).

<!-- example(ag-grid-overview) -->

### Стилизация таблиц

Для единства стиля таблиц в проектах создана тема [`@koobiq/ag-grid-angular-theme`](https://github.com/koobiq/data-grid/blob/main/packages/ag-grid-angular-theme/README.md). Она включает готовые стили, соответствующие дизайн-системе. Тема поддерживает основные функции AG grid и упрощает настройку внешнего вида таблицы.

#### Установка

<div class="kbq-callout kbq-callout_theme">
<div class="kbq-callout__header">Обратите внимание</div>
<div class="kbq-callout__content kbq-docs-element-last-child-margin-bottom-0">

Тема совместима с AG grid [версии 30](https://github.com/ag-grid/ag-grid/tree/v30.2.1).

</div>
</div>

Установите следующие пакеты:

```bash
npm install @koobiq/ag-grid-angular-theme@^30 ag-grid-community@^30 ag-grid-angular@^30
```

#### Подключение темы

Импортируйте тему в основной файл стилей `styles.scss`:

```scss
@use '@koobiq/ag-grid-angular-theme';
```

Примените тему для `<ag-grid-angular>` в шаблоне:

```ts
import { KbqAgGridTheme } from '@koobiq/ag-grid-angular-theme';
import { AgGridModule } from 'ag-grid-angular';

@Component({
    imports: [AgGridModule, KbqAgGridTheme],
    template: `<ag-grid-angular kbqAgGridTheme />`
})
```

Полная документация по использованию темы хранится [в репозитории на GitHub](https://github.com/koobiq/data-grid/blob/main/packages/ag-grid-angular-theme/README.md).

### Рекомендации

- Используйте компонент [Table](/ru/components/table) для простых таблиц с малым объемом данных, не требующих изменения ширины и порядка колонок.
- Если в списке всего одна колонка, то используйте [List](/ru/components/list) или [Tree](/ru/components/tree).
