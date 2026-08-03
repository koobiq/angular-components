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
