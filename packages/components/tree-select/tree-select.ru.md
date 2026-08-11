### With default parameters

<!-- example(tree-select-overview) -->

### Multiple tree-select

<!-- example(tree-select-multiple-overview) -->

### Multiline tree-select (multiline)

<!-- example(tree-select-with-multiline-matcher) -->

### Multiple with child selection

<!-- example(tree-select-child-selection-overview) -->

### With search

<!-- example(tree-select-search-overview) -->

### Мастер-чекбокс «Выбрать все»

Если узлов много, атрибут `selectAll` добавляет над деревом мастер-чекбокс, который одним действием выбирает их все либо снимает выделение со всех. Работает только при множественном выборе.

<!-- prettier-ignore -->
```html
<kbq-tree-select multiple selectAll>
    <kbq-tree-selection [dataSource]="dataSource" [treeControl]="treeControl">
        <kbq-tree-option *kbqTreeNodeDef="let node" kbqTreeNodePadding>
            {{ treeControl.getViewValue(node) }}
        </kbq-tree-option>
    </kbq-tree-selection>
</kbq-tree-select>
```

Без поискового запроса чекбокс охватывает всё дерево, включая свёрнутые ветки. При активном запросе — только узлы на экране: найденные и те родители, которые остались видимыми ради них. Неактивные (`disabled`) узлы игнорируются: они не выбираются и не снимаются, а состояние чекбокса отражает только те узлы, которые пользователь действительно может переключить. Подпись берётся из локали (`select.selectAll`).

Строка участвует в клавиатурной навигации как первый элемент дерева, и каждое действие по ней порождает событие `onSelectAll`.

<!-- example(tree-select-select-all) -->

### Выбор всех значений с клавиатуры

`Ctrl`/`Cmd` + `A` выбирает все узлы при множественном выборе. По умолчанию повторное нажатие оставляет их выбранными; атрибут `selectAllToggle` заставляет его снимать выделение. При включённом `selectAll` сочетание всегда работает как переключатель — так оно не может разойтись с мастер-чекбоксом.

Внутри непустого поля поиска первое нажатие выделяет текст поля, следующее переходит к узлам. Поведение можно полностью заменить через инпут `selectAllHandler`.

### Lazy loading tree-select

<!-- example(tree-select-lazyload) -->

### With custom footer

<!-- example(tree-select-footer-overview) -->

### Высота выпадающего списка

По умолчанию максимальная высота списка равна 256px, и список прокручивается, когда дерево в него не помещается. Изменить её можно атрибутом `panelMaxHeight` со значением в пикселях.

<!-- example(tree-select-height) -->

`panelMaxHeight` ограничивает прокручиваемый список. Строка поиска и нижний колонтитул находятся рядом со списком, поэтому они добавляются к общей высоте панели. Значение больше оставшегося места в видимой области будет обрезано оверлеем, а не прокручено.

Для всех выпадающих списков в модуле — через провайдер `kbqTreeSelectOptionsProvider`:

```ts
import { kbqTreeSelectOptionsProvider } from '@koobiq/components/tree-select';

@NgModule({
    providers: [
        kbqTreeSelectOptionsProvider({ panelMaxHeight: 400 })
    ]
})
```

Для темизации та же высота доступна через токен `--kbq-select-panel-size-max-height`: задайте его на `:root`, чтобы изменить все панели сразу, или на классе, переданном через `panelClass`, — чтобы изменить одну.

### Ширина выпадающего списка

По умолчанию ширина выпадающего списка равна ширине поля и увеличивается, когда в списке появляется длинный текст. Это поведение можно изменить с помощью атрибута `panelWidth`:

- `auto` — список совпадает по ширине с полем, но не становится меньше `panelMinWidth`.
- число или CSS-значение — используется как точная ширина, поэтому `panelMinWidth` к ней не применяется.

Список не становится меньше `panelMinWidth` (по умолчанию 200 px). Чтобы снять это ограничение, задайте `panelMinWidth` равным `0`.

Рост по содержимому останавливается на 640 px. Ограничение мягкое: оно не делает список меньше ширины поля и не уменьшает явно заданный `panelWidth`. Изменить его можно атрибутом `panelMaxWidth` или глобально через токен `--kbq-panel-size-width-max`.

Для определенного выпадающего списка:

```ts
@Component({
    template: `
        <kbq-form-field>
            <kbq-tree-select [panelWidth]="700">...</kbq-tree-select>
        </kbq-form-field>
    `
})
```

Для всех выпадающих списков в модуле, используя _Dependency Injection_ при помощи `kbqTreeSelectOptionsProvider` провайдера:

```ts
import { kbqTreeSelectOptionsProvider } from '@koobiq/components/tree-select';

@NgModule({
    providers: [
        kbqTreeSelectOptionsProvider({ panelWidth: 'auto' })
    ]
})
```
