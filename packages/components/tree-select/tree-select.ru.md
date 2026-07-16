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

По умолчанию ширина выпадающего списка равна селекту и она увеличивается, когда в списке будет длинный текст. Это поведение можно изменить при помощи `panelWidth` атрибута:

- `auto` — список совпадает по ширине с селектом, но не становится уже `panelMinWidth`.
- число или CSS-значение — применяется как точная ширина, поэтому `panelMinWidth` к ней не применяется.

Список никогда не становится уже `panelMinWidth`, который по умолчанию равен 200px. Чтобы снять это ограничение, задайте `panelMinWidth` равным `0`.

Рост по контенту останавливается на 640px. Потолок мягкий — он никогда не делает список уже селекта и не обрезает явный `panelWidth`. Изменить его можно атрибутом `panelMaxWidth` или глобально через токен `--kbq-panel-size-width-max`.

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
