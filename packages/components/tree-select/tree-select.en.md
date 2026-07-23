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

### Dropdown width

By default, the dropdown width equals the select width and grows when the list contains long text. This behavior can be changed using the `panelWidth` attribute:

- `auto` — the dropdown matches the select width, but never gets narrower than `panelMinWidth`.
- a number or a CSS value — used as an exact width, so `panelMinWidth` is not applied to it.

The dropdown never gets narrower than `panelMinWidth`, which is 200px by default. Set `panelMinWidth` to `0` to remove that limit.

Growth by content stops at 640px. The cap is soft — it never makes the dropdown narrower than the select, and never clamps an explicit `panelWidth`. Change it with `panelMaxWidth`, or globally through the `--kbq-panel-size-width-max` token.

For a specific dropdown:

```ts
@Component({
    template: `
        <kbq-form-field>
            <kbq-tree-select [panelWidth]="700">...</kbq-tree-select>
        </kbq-form-field>
    `
})
```

For all dropdowns in a module, using _Dependency Injection_ with the `kbqTreeSelectOptionsProvider` provider:

```ts
import { kbqTreeSelectOptionsProvider } from '@koobiq/components/tree-select';

@NgModule({
    providers: [
        kbqTreeSelectOptionsProvider({ panelWidth: 'auto' })
    ]
})
```
