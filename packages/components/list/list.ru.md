#### With default parameters (autoselect="true", no-unselect="true")

<!-- example(list-overview) -->

### Single mode with groups

<!-- example(list-groups) -->

### Multiple mode with checkboxes

<!-- example(list-multiple-checkbox) -->

### Multiple mode without checkboxes

<!-- example(list-multiple-keyboard) -->

### Action button

<!-- example(list-action-button) -->

### Virtual scroll

<!-- example(list-virtual-scroll) -->

### Доступность

`kbq-list-selection` объявляется как `listbox`, а каждый `kbq-list-option` — как `option` с собственным `aria-selected`. С `multiple` список дополнительно помечается `aria-multiselectable`, а с `horizontal` сообщает `aria-orientation="horizontal"` и переключает активный элемент стрелками влево/вправо. Список — одна точка табуляции, внутри него фокус перемещается roving-навигацией. Отключённые список и элемент сообщаются через `aria-disabled`. Встроенный псевдочекбокс декоративен и в дерево доступности не попадает; если вы проецируете свой `kbq-pseudo-checkbox` (`externalPseudoCheckbox`), тоже пометьте его `aria-hidden="true"` — состояние выбора уже передаёт `aria-selected` самого элемента.

Listbox должен иметь доступное имя, поэтому задайте его через `aria-label` или `aria-labelledby`:

```html
<kbq-list-selection aria-label="Почтовые ящики">
    <kbq-list-option [value]="'inbox'">Входящие</kbq-list-option>
    <kbq-list-option [value]="'starred'">Помеченные</kbq-list-option>
</kbq-list-selection>
```

У `kbq-list` и `kbq-list-item` роли намеренно нет: это обычный контейнер, который используется и для семантических списков, и для чисто визуальной группировки. Если содержимое — настоящий список, добавьте `role="list"` / `role="listitem"` самостоятельно.
