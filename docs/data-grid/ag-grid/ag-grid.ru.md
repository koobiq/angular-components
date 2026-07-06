AG grid предназначен для работы с большими таблицами. Компонент поддерживает сортировку, виртуальную прокрутку, изменение ширины и порядка колонок. Основан на библиотеке [ag-grid-angular](https://www.ag-grid.com/angular-data-grid/).

<!-- example(ag-grid-overview) -->

### Стилизация таблиц

Для единства стиля таблиц в проектах создана тема [`@koobiq/ag-grid-angular-theme`](https://github.com/koobiq/data-grid/blob/main/packages/ag-grid-angular-theme/README.md). Она включает готовые стили, соответствующие дизайн-системе. Тема поддерживает основные функции AG grid и упрощает настройку внешнего вида таблицы.

#### Установка

Установите следующие пакеты:

```bash
npm install @koobiq/ag-grid-angular-theme@^34 ag-grid-community@^34 ag-grid-angular@^34
```

#### Подключение темы

Импортируйте тему в основной файл стилей `styles.scss`:

```scss
@use '@koobiq/ag-grid-angular-theme';
```

Примените тему для `<ag-grid-angular>` в шаблоне:

```ts
import { KbqAgGridThemeModule } from '@koobiq/ag-grid-angular-theme';
import { AgGridModule } from 'ag-grid-angular';

@Component({
    imports: [AgGridModule, KbqAgGridThemeModule],
    template: `<ag-grid-angular kbqAgGridTheme />`
})
```

Полная документация по использованию темы хранится [в репозитории на GitHub](https://github.com/koobiq/data-grid/blob/main/packages/ag-grid-angular-theme/README.md).

### Отключение стилей фокуса ячеек

Для этого добавьте атрибут `kbqAgGridThemeDisableCellFocusStyles` к `<ag-grid-angular>`:

```html
<ag-grid-angular kbqAgGridTheme kbqAgGridThemeDisableCellFocusStyles />
```

### Перетаскивание строк

<!-- example(ag-grid-row-dragging) -->

### Действия в строке

Директива `kbqAgGridRowActions` добавляет панель действий, появляющуюся при наведении на строку.

<!-- example(ag-grid-row-actions) -->

### Копирование выделенных строк

Директива `kbqAgGridCopyByCtrlC` позволяет копировать выделенные строки в буфер обмена при помощи комбинации клавиш `Ctrl+C`.

<!-- example(ag-grid-copy-selected) -->

### Панель статуса

Директива `kbqAgGridStatusBar` добавляет настраиваемую панель под таблицей.

<!-- example(ag-grid-status-bar) -->

### Сохранение состояния

Директивы сохраняют и восстанавливают состояние таблицы после перезагрузки страницы.

По умолчанию используется `LocalStorageStore`. При необходимости можно переключиться на `QueryParamsStore`.

#### Колонки

Директива `kbqAgGridColumnState` сохраняет сортировку, порядок, видимость и ширину колонок. Добавьте её с уникальным ключом и подключите провайдер хранилища через `kbqAgGridColumnStateStoreProvider`.

<!-- example(ag-grid-column-state) -->

#### Фильтры

Директива `kbqAgGridFilterState` сохраняет модели фильтров колонок. Добавьте её с уникальным ключом и подключите провайдер хранилища через `kbqAgGridFilterStateStoreProvider`.

<!-- example(ag-grid-filter-state) -->

#### Быстрый фильтр

Директива `kbqAgGridQuickFilterState` сохраняет значение быстрого фильтра. Добавьте её с уникальным ключом, подключите провайдер хранилища через `kbqAgGridQuickFilterStateStoreProvider` и привяжите значение поля ввода через `[(kbqAgGridQuickFilterStateValue)]`.

<!-- example(ag-grid-quick-filter-state) -->

#### Внешний фильтр

Директива `kbqAgGridExternalFilterState` сохраняет значение внешнего фильтра. Добавьте её с уникальным ключом, подключите провайдер хранилища через `kbqAgGridExternalFilterStateStoreProvider`, привяжите значение через `[(kbqAgGridExternalFilterStateValue)]` и передайте функцию проверки строк через `kbqAgGridExternalFilterStatePass`.

<!-- example(ag-grid-external-filter-state) -->

### Меню колонок

Директива `kbqAgGridColumnMenu` добавляет кнопку управления колонками в правом верхнем углу таблицы. Панель позволяет переключать видимость колонок, изменять их порядок перетаскиванием и закреплять слева или справа.

По умолчанию используются русские подписи. Для смены языка подключите провайдер:

```ts
providers: [kbqAgGridColumnMenuLabelsProvider(KBQ_AG_GRID_COLUMN_MENU_LABELS_EN)];
```

Чтобы запретить скрытие конкретной колонки, добавьте `lockVisible: true` в её `ColDef`.

<!-- example(ag-grid-column-menu) -->

### Оверлей загрузки

Директива `kbqAgGridLoadingOverlay` управляет состоянием загрузки таблицы: когда значение `true`, поверх строк отображается скелетон-оверлей. Число строк и колонок скелетона задаётся через `kbqAgGridLoadingOverlayConfigProvider`.

<!-- example(ag-grid-loading-overlay) -->

### Скелетон в ячейках

`KbqAgGridSkeletonCellRenderer` используется совместно с моделью бесконечной прокрутки (`rowModelType="infinite"`). Пока блок данных не загружен (`params.data === undefined`), ячейки отображают скелетон-заглушки.

<!-- example(ag-grid-skeleton-cell-renderer) -->

### Выбор строк при бесконечной прокрутке

При бесконечной прокрутке данные подгружаются блоками, поэтому выбрать их все обычным списком нельзя — большая часть еще не загружена. Директива `kbqAgGridInfiniteSelection` инвертирует выбор: вместо перечня выбранных строк она хранит признак «выбраны все» и список исключений.

Такое состояние повторяет условие «все, кроме указанных ID», поэтому его можно передать на сервер, не загружая все строки.

Директиве нужны два параметра:

- `kbqAgGridInfiniteSelectionDatasource` принимает источник данных. Когда выбраны все строки, подгружаемые блоки добавляются в выбор автоматически.
- `getRowId` возвращает стабильный уникальный идентификатор строки.

<!-- example(ag-grid-infinite-selection) -->

### Пользовательские сочетания клавиш

Вы можете добавить пользовательские сочетания клавиш, добавив соответствующие директивы к вашему компоненту `<ag-grid-angular>`.

| <div style="min-width: 120px;">Клавиша</div>                                                    | Действие                     | Директива                         |
| ----------------------------------------------------------------------------------------------- | ---------------------------- | --------------------------------- |
| <span class="docs-hot-key-button">Tab</span>                                                    | Перейти к следующей строке   | `kbqAgGridToNextRowByTab`         |
| <span class="docs-hot-key-button">Shift</span> + <span class="docs-hot-key-button">↓↑</span>    | Выделить несколько строк     | `kbqAgGridSelectRowsByShiftArrow` |
| <span class="docs-hot-key-button">Ctrl</span> + <span class="docs-hot-key-button">click</span>  | Выделить строку              | `kbqAgGridSelectRowsByCtrlClick`  |
| <span class="docs-hot-key-button">Ctrl</span> + <span class="docs-hot-key-button">C</span>      | Копировать выделенные строки | `kbqAgGridCopyByCtrlC`            |
| <span class="docs-hot-key-button">Shift</span> + <span class="docs-hot-key-button">click</span> | Выделить диапазон строк      | `kbqAgGridSelectRowsByShiftClick` |
| <span class="docs-hot-key-button">Ctrl</span> + <span class="docs-hot-key-button">A</span>      | Выделить все строки          | `kbqAgGridInfiniteSelection`      |

Больше информации о сочетаниях клавиш можно найти в [документации ag-grid-angular](https://www.ag-grid.com/angular-data-grid/keyboard-navigation/).

### Рекомендации

- Используйте компонент [Table](/ru/components/table) для простых таблиц с малым объемом данных, не требующих изменения ширины и порядка колонок.
- Если в списке всего одна колонка, то используйте [List](/ru/components/list) или [Tree](/ru/components/tree).
