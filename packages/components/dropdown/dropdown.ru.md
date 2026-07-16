<!-- example(dropdown-overview) -->

### Отключенный триггер

<!-- example(dropdown-disabled) -->

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

По умолчанию панель растёт по контенту, никогда не бывает уже своего триггера и уже 200px, и останавливается на 640px. Настраивается теми же атрибутами `panelWidth`, `panelMinWidth` и `panelMaxWidth`, что и у [select](ru/components/select) и [autocomplete](ru/components/autocomplete):

```html
<!-- Точно по ширине триггера -->
<kbq-dropdown panelWidth="auto" />

<!-- Точная ширина; panelMinWidth не применяется -->
<kbq-dropdown [panelWidth]="400" />

<!-- Разрешить панели расти по контенту дальше -->
<kbq-dropdown [panelMaxWidth]="800" />
```

Потолок в 640px мягкий: он ограничивает только рост по контенту, поэтому триггер шире 640px всё равно получит панель по своей ширине, а явный `panelWidth` не обрезается.

Значения по умолчанию берутся из токенов и переопределяются темой:

| Токен                                     | По умолчанию                             |
| ----------------------------------------- | ---------------------------------------- |
| `--kbq-dropdown-size-container-width-min` | `200px`                                  |
| `--kbq-dropdown-size-container-width-max` | `var(--kbq-panel-size-width-max, 640px)` |

`--kbq-panel-size-width-max` общий для всех выпадающих панелей библиотеки, поэтому, задав его один раз на `:root`, вы ограничите select, tree-select, autocomplete и dropdown разом.

Вложенные панели и панели, перекрывающие триггер по вертикали, по триггеру не выравниваются — для них работают только токены.

Если триггер — лишь часть более крупного контрола, задайте `KbqDropdownTrigger.widthOrigin`, указав элемент, с которым панель должна совпадать. [Split button](ru/components/split-button) делает это через свой input `panelAutoWidth`.
