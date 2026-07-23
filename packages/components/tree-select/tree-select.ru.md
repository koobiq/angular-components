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
