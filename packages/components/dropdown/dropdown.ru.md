<!-- example(dropdown-overview) -->

### Отключенный триггер

<!-- example(dropdown-disabled) -->

### Состояние загрузки

Добавьте атрибут `progress` к `kbq-dropdown-item`, чтобы отобразить анимацию загрузки на элементе. Его можно совмещать с `disabled`, чтобы дополнительно запретить взаимодействие с элементом во время загрузки.

<!-- example(dropdown-item-progress) -->

### Футер

В нижнем колонтитуле можно разместить вспомогательные элементы: [кнопки](ru/components/button), [ссылки](ru/components/link), подсказки.

<!-- example(dropdown-with-footer) -->

### Открытие по стрелке вниз ↓

<!-- example(dropdown-open-by-arrow-down) -->

### Ленивая загрузка данных

<!-- example(dropdown-lazyload-data) -->

### Вложенные элементы

<!-- example(dropdown-nested) -->

### Циклическая навигация

Режим "циклической навигации" по списку,
где после достижения одного конца списка мы переходим к другому.

<!-- example(dropdown-navigation-wrap) -->

### Динамическое отображение

Рекурсивное отображение массива или объекта, позволяющее создавать вложенные выпадающие меню.

<!-- example(dropdown-recursive-template) -->

### Поиск в меню

<!-- example(dropdown-with-filter) -->

## Выравнивание по горизонтали

Используйте свойство `xPosition` для управления горизонтальным выравниванием панели выпадающего меню относительно триггера. Поддерживаемые значения: `'after'` (по умолчанию), `'before'` и `'center'`.

<!-- example(dropdown-x-position) -->

## Ширина панели

По умолчанию панель растет по содержимому, но не становится меньше ширины триггера или 200 px, а рост останавливается на 640 px. Настраивается теми же атрибутами `panelWidth`, `panelMinWidth` и `panelMaxWidth`, что и у [Select](ru/components/select) и [Autocomplete](ru/components/autocomplete):

```html
<!-- По ширине триггера -->
<kbq-dropdown panelWidth="auto" />

<!-- Точная ширина; panelMinWidth не применяется -->
<kbq-dropdown [panelWidth]="400" />

<!-- Изменена максимальная ширина раскрывающегося списка -->
<kbq-dropdown [panelMaxWidth]="800" />
```

Ограничение в 640 px мягкое и действует только на рост по содержимому. Оно не делает панель меньше ширины триггера и не уменьшает явно заданный `panelWidth`: если любое из этих значений больше 640 px, панель будет ровно такой ширины.

Значения по умолчанию заданы токенами:

| Токен                                     | По умолчанию                             |
| ----------------------------------------- | ---------------------------------------- |
| `--kbq-dropdown-size-container-width-min` | `200px`                                  |
| `--kbq-dropdown-size-container-width-max` | `var(--kbq-panel-size-width-max, 640px)` |

Токен `--kbq-panel-size-width-max` — общий для всех выпадающих панелей библиотеки. Задайте его один раз на `:root`, чтобы ограничить [Select](ru/components/select), [Tree-select](ru/components/tree-select), [Autocomplete](ru/components/autocomplete) и [Dropdown](ru/components/dropdown) одновременно.

Вложенные панели и панели, перекрывающие триггер по вертикали, по триггеру не выравниваются — для них работают только токены.

Если триггер — только часть более крупного элемента управления, задайте `KbqDropdownTrigger.widthOrigin`, указав элемент, с которым панель должна совпадать. [Split button](ru/components/split-button) делает это через параметр `panelAutoWidth`.
