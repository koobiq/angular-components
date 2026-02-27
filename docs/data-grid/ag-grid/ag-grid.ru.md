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

Для этого добавьте атрибут `disableCellFocusStyles` к `<ag-grid-angular>`:

```html
<ag-grid-angular kbqAgGridTheme disableCellFocusStyles />
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

### Пользовательские сочетания клавиш

Вы можете добавить пользовательские сочетания клавиш, добавив соответствующие директивы к вашему компоненту `<ag-grid-angular>`.

| <div style="min-width: 120px;">Клавиша</div>                                                   | Действие                     | Директива                         |
| ---------------------------------------------------------------------------------------------- | ---------------------------- | --------------------------------- |
| <span class="docs-hot-key-button">Tab</span>                                                   | Перейти к следующей строке   | `kbqAgGridToNextRowByTab`         |
| <span class="docs-hot-key-button">Shift</span> + <span class="docs-hot-key-button">↓↑</span>   | Выделить несколько строк     | `kbqAgGridSelectRowsByShiftArrow` |
| <span class="docs-hot-key-button">Ctrl</span> + <span class="docs-hot-key-button">A</span>     | Выделить все строки          | `kbqAgGridSelectAllRowsByCtrlA`   |
| <span class="docs-hot-key-button">Ctrl</span> + <span class="docs-hot-key-button">click</span> | Выделить строку              | `kbqAgGridSelectRowsByCtrlClick`  |
| <span class="docs-hot-key-button">Ctrl</span> + <span class="docs-hot-key-button">C</span>     | Копировать выделенные строки | `kbqAgGridCopyByCtrlC`            |

Больше информации о сочетаниях клавиш можно найти в [документации ag-grid-angular](https://www.ag-grid.com/angular-data-grid/keyboard-navigation/).

### Рекомендации

- Используйте компонент [Table](/ru/components/table) для простых таблиц с малым объемом данных, не требующих изменения ширины и порядка колонок.
- Если в списке всего одна колонка, то используйте [List](/ru/components/list) или [Tree](/ru/components/tree).
