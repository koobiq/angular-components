Tree Select lets users search and select one or more values from hierarchical data while preserving the tree structure.

### With default parameters

<!-- example(tree-select-overview) -->

### Multiple tree-select

<!-- example(tree-select-multiple-overview) -->

### Multiline tree-select (multiline)

<!-- example(tree-select-with-multiline-matcher) -->

A multiline trigger grows with every selected option, so a long selection can make it taller than the dropdown
itself. When that happens and the panel fits neither below the trigger nor above it, the panel is anchored to
the trigger's first row and drawn over the rest of them, opening one gap below that row. The first row, the
chevron and the cleaner stay visible and clickable.

### Multiple with child selection

<!-- example(tree-select-child-selection-overview) -->

### Counter of the hidden items

When the selected nodes do not fit on one line, the ones that are left out are replaced with a counter. Its text follows the active locale (`select.hiddenItemsText`) and can be overridden with the `hiddenItemsText` attribute — a value set there wins over the locale and survives a locale change. The number placeholder inside the text is replaced with the number of hidden items:

```ts
@Component({
    template: `
        <kbq-form-field>
            <kbq-tree-select multiple [hiddenItemsText]="hiddenItemsText">...</kbq-tree-select>
        </kbq-form-field>
    `
})
class Example {
    readonly hiddenItemsText = 'and {{ number }} more';
}
```

`hiddenItemsTextFormatter` is the function that performs the substitution, `(hiddenItemsText: string, hiddenItems: number) => string`. Replace it to build the label differently.

The counter is only rendered in multiple selection mode and only while `multiline` is off — a multiline trigger wraps the tags instead of hiding them.

### With search

<!-- example(tree-select-search-overview) -->

### Select all

In multiple selection mode all the nodes can be selected at once. The feature is off by default — turn it on with the `selectAll` attribute, and a master checkbox appears above the tree.

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

The checkbox has three states: unchecked, indeterminate, and checked — clicking it while indeterminate selects the remaining nodes rather than clearing the selection. Without a search query it covers the whole data set, collapsed branches included; while a query is active it covers only the nodes on screen — the matches and the ancestors kept visible for them. Disabled nodes are ignored. The row takes part in keyboard navigation as the first item of the tree, and every action on it emits `onSelectAll`. The label comes from the locale (`select.selectAll`).

<!-- example(tree-select-select-all) -->

Once everything is selected, the control can show a label of its own instead of literally listing the selected nodes. Project a `<kbq-select-trigger>` while the tree's `allOptionsSelected` is `true` — without it the tree-select falls back to its default trigger. Use the element (or an element carrying the `kbq-select-trigger` attribute) rather than an `<ng-container>`: the trigger is stretched to the full width of the control by a rule on that element, and an `ng-container` leaves nothing for it to apply to, so the label and the arrow end up bunched together.

<!-- example(tree-select-select-all-label) -->

### Selecting everything from the keyboard

`Ctrl`/`Cmd` + `A` selects all nodes in multiple selection mode. By default a repeated press keeps them selected; `selectAllToggle` makes it deselect them instead. With `selectAll` the shortcut always toggles both ways, so it and the master checkbox cannot disagree.

Inside a non-empty search field the first press selects the text of the field; the next one falls through to the nodes. The behaviour can be replaced wholesale with the `selectAllHandler` input.

### Lazy loading tree-select

<!-- example(tree-select-lazyload) -->

### With custom footer

<!-- example(tree-select-footer-overview) -->

### Accessibility

The control is a `role="combobox"`: it reports `aria-expanded`, points `aria-controls` at the dropdown while it is open, and mirrors its validity and its required state into `aria-invalid`/`aria-required`. Opening the dropdown moves the focus into it — onto the node the keyboard is on, or into the search field when one is projected — so while the dropdown is open a screen reader reads the panel rather than the control.

A combobox has to be named, and a `kbq-form-field` label does not name it — `<label for>` only names native form controls. Left unnamed, the control falls back to its `placeholder`. Prefer `aria-labelledby` pointing at text that is already on screen, and reach for `aria-label` when nothing on the page holds the caption:

```html
<kbq-form-field>
    <kbq-tree-select aria-label="Files">...</kbq-tree-select>
</kbq-form-field>

<h3 id="files-caption">Files</h3>
<kbq-form-field>
    <kbq-tree-select aria-labelledby="files-caption">...</kbq-tree-select>
</kbq-form-field>
```

From the keyboard, `Escape` and `Alt` + arrow close the dropdown and return the focus to the control, while `Tab` closes it and moves on to the next control the way it does everywhere else.

### Dropdown height

By default, the maximum height of the list is 256px, and the list scrolls once the tree does not fit. Use the `panelMaxHeight` attribute with a value in pixels to change it.

<!-- example(tree-select-height) -->

`panelMaxHeight` caps the scrollable list. A search field and a footer are rendered beside the list, so they add to the total height of the panel. A value larger than the space left in the viewport is clipped by the overlay rather than scrolled.

For all dropdowns in a module, using the `kbqTreeSelectOptionsProvider` provider:

```ts
import { kbqTreeSelectOptionsProvider } from '@koobiq/components/tree-select';

@NgModule({
    providers: [
        kbqTreeSelectOptionsProvider({ panelMaxHeight: 400 })
    ]
})
```

For theming, the same height is available as the `--kbq-select-panel-size-max-height` token — set it on `:root` to change every panel at once, or on a class passed through `panelClass` to change a single one.

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
