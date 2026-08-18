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

### Перестановка и сортировка

Для включения возможности перестановки опций необходимо установить свойство `draggable` для `kbq-list-selection`.

Во время перетаскивания список не раздвигается: соседние опции остаются на местах, перетаскиваемая
сохраняет своё место в виде приглушённой строки, а позицию, куда она встанет, показывает линия.

Список никогда не изменяет данные сам — он сообщает о перемещении через событие `dropped`, а применяете
его вы, обычно с помощью `moveItemInArray` из `@angular/cdk/drag-drop`. Отслеживайте опции по
идентификатору (`track item.id`): при позиционном ключе вроде `track $index` опция на своём месте
сохраняется и получает новое значение, а смена значения сбрасывает её выбор.

<!-- example(list-draggable) -->

Опции можно переносить и в другой список. Передайте соседний `kbq-list-selection` в `connectedTo` у
обоих списков и примените перемещение через `transferArrayItem`. В списке-приёмнике опция появляется
невыбранной, если её значения ещё нет в его модели.

<!-- example(list-draggable-connected) -->

Перетаскивание не поддерживается внутри `kbq-optgroup` и `cdk-virtual-scroll-viewport`: индексы в
событии `dropped` учитывают только отрисованные опции либо отсчитываются от группы, а не от списка,
поэтому применение перемещения к массиву данных незаметно затронет не тот элемент. В режиме разработки
оба случая выводят предупреждение.

#### Навигация с клавиатуры

У перетаскивания всегда есть клавиатурный эквивалент, поэтому функция остаётся доступной без указателя.

| <div style="min-width: 270px;">Клавиша</div>                                                                                           | Действие                                       |
| -------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------- |
| <span class="docs-hot-key-button">Alt</span> + <span class="docs-hot-key-button">↑</span> / <span class="docs-hot-key-button">↓</span> | Переместить опцию в фокусе на одну позицию.    |
| <span class="docs-hot-key-button">Alt</span> + <span class="docs-hot-key-button">←</span> / <span class="docs-hot-key-button">→</span> | Переместить опцию в фокусе в связанный список. |

Новая позиция объявляется через live-регион. До списков, связанных по `id`, а не по ссылке на
компонент, с клавиатуры добраться нельзя, и индикатор в них не показывается: по `id` нельзя получить
экземпляр списка, который должен его нарисовать.

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
