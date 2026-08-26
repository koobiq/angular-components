Select - allows the user to select one or more values from a predefined list.

<!-- example(select-overview) -->

### States

#### Validation

<!-- example(select-validation) -->

#### Inactive states

<!-- example(select-disabled) -->

#### Reset selected value

When a value is selected once, the reset control is hidden. Its display can be enabled separately.

<!-- example(select-cleaner) -->

#### Multiple selection

<!-- example(select-multiple) -->

#### Multiple selection (multiline)

<!-- example(select-with-multiline-matcher) -->

A multiline trigger grows with every selected option, so a long selection can make it taller than the dropdown
itself. When that happens and the panel fits neither below the trigger nor above it, the panel is anchored to
the trigger's first row and drawn over the rest of it — where it would sit if the trigger had a single row. The
first row, the chevron and the cleaner stay visible and clickable.

#### Customizing tags

In multiple selection mode the markup of every tag can be replaced with your own. Declare an `<ng-template #kbqSelectTagContent>` inside `<kbq-select>` — it is rendered once per selected option and receives the option as `$implicit` and the `KbqSelect` instance as `select`:

<!-- prettier-ignore -->
```html
<ng-template #kbqSelectTagContent let-option let-select="select">
    <kbq-tag [selectable]="false" [disabled]="option.disabled || select.disabled">
        {{ option.viewValue }}
        @if (!option.disabled && !select.disabled) {
            <i kbq-icon="kbq-xmark-s_16" kbqTagRemove (click)="select.onRemoveMatcherItem(option, $event)"></i>
        }
    </kbq-tag>
</ng-template>
```

The template replaces the built-in markup completely, so the color, the disabled state and the remove control have to be reproduced by hand. Keep `<kbq-tag>` as the root element: the “+N” counter of hidden tags measures the rendered `kbq-tag` elements, and any other root element breaks it.

#### Grouping values

<!-- example(select-groups) -->

#### Filling a list of values

##### List with search

Use search when the list has more than 10 items.

Search can be by first character or full match, depending on the specific task and user preferences.

<!-- example(select-search) -->

##### Select all

In multiple selection mode all the values can be selected at once. The feature is off by default — turn it on with the `selectAll` attribute, and a master checkbox appears above the list.

<!-- prettier-ignore -->
```html
<kbq-select multiple selectAll placeholder="Placeholder">
    <kbq-option [value]="option">{{ option }}</kbq-option>
</kbq-select>
```

The checkbox has three states: unchecked when nothing is selected, indeterminate when only some options are, and checked when every option is. Clicking it while indeterminate selects the remaining options rather than clearing the selection. The label comes from the locale (`select.selectAll`).

Disabled options are ignored — they are neither selected nor deselected, and the checkbox state reflects only the options the user can actually toggle. When searching, the checkbox acts only on the results that match the query. Every action on the row emits a single `selectionChange` for the whole batch, followed by `onSelectAll`.

Not supported together with `withVirtualScroll` or `showPreselectedValues`: the row is not rendered when either is on, since "select all" can only act on the options currently rendered as `KbqOption`, not on the full virtualized or preselected data set.

<!-- example(select-select-all) -->

Once everything is selected, the control can show a label of its own instead of literally listing the selected options. Project a `<kbq-select-trigger>` while `allOptionsSelected` is `true` — without it the select falls back to its default trigger. Use the element (or an element carrying the `kbq-select-trigger` attribute) rather than an `<ng-container>`: the trigger is stretched to the full width of the control by a rule on that element, and an `ng-container` leaves nothing for it to apply to, so the label and the arrow end up bunched together.

<!-- example(select-select-all-label) -->

##### Selecting everything from the keyboard

`Ctrl`/`Cmd` + `A` selects all options in multiple selection mode. By default a repeated press keeps them selected; `selectAllToggle` makes it deselect them instead. With `selectAll` the shortcut always toggles both ways, so it and the master checkbox cannot disagree.

Inside a non-empty search field the first press selects the text of the field; the next one falls through to the options. The behaviour can be replaced wholesale with the `selectAllHandler` input — `onSelectAll` is then not emitted for the shortcut, as the handler owns the behaviour.

##### Footer List

If additional controls need to be arranged, you can enable the display of a footer. You can display various auxiliary controls in the footer: buttons, links, tooltips.

<!-- example(select-footer) -->

#### Select height

By default, the maximum height of the list is 256px. When there are many selections in the select-footer, the drop-down menu will appear scrolling.

You can customize the height if needed. For example, in a normal menu, 7-8 items are visible. If there are 10 options to choose from, you can increase the height of the list and show all the items without hiding a small part under the scroll. Use the `panelMaxHeight` attribute with a value in pixels.

<!-- example(select-height) -->

`panelMaxHeight` caps the scrollable option list. A search field and a footer are rendered beside the list, so they add to the total height of the panel. A value larger than the space left in the viewport is clipped by the overlay rather than scrolled. With `cdk-virtual-scroll-viewport` the value is an exact height rather than a cap, because a virtual scroller needs a definite height.

To set the height for all selects within a module that share common display rules, you can use the `kbqSelectOptionsProvider`.

```ts
import { kbqSelectOptionsProvider } from '@koobiq/components/select';

@NgModule({
    providers: [
        kbqSelectOptionsProvider({ panelMaxHeight: 400 })
    ]
})
```

For theming, the same height is available as the `--kbq-select-panel-size-max-height` token — set it on `:root` to change every panel at once, or on a class passed through `panelClass` to change a single one. The example above shows both approaches side by side.

### Select width

#### Basic settings

The width of the select matches the select by default and expands if the list contains long text.

<!-- example(select-with-panel-width-default) -->

The select panel has a default `min-width` of 200px to align nicely with narrow selects. You can customize this by setting the `panelMinWidth` attribute with a numeric value.

<!-- example(select-with-panel-min-width) -->

To set the minimum width of select panel for all selects within a module that share common display rules, you can use the `kbqSelectOptionsProvider`.

```ts
import { kbqSelectOptionsProvider } from '@koobiq/components/select';

@NgModule({
    providers: [
        kbqSelectOptionsProvider({ panelMinWidth: 350 })
    ]
})
```

#### Additional options

If needed, the select width can be set to match the select width exactly. To do this, use the `panelWidth` attribute with the value `auto`. The panel still never gets narrower than `panelMinWidth` — set `panelMinWidth` to `0` if you want the panel to follow a narrow select exactly.

<!-- example(select-with-panel-width-auto) -->

To set a fixed width of 400px for the select, use the `panelWidth` attribute with the value `400`. A fixed width is used exactly as given, so `panelMinWidth` is not applied to it.

<!-- example(select-with-panel-width-fixed) -->

A panel growing with long option text stops at 640px. The cap is soft — it never makes the panel narrower than the select, and never clamps an explicit `panelWidth`. Raise or lower it for one select with `panelMaxWidth`, or for the whole application by setting the `--kbq-panel-size-width-max` token on `:root` (it is shared with tree-select, autocomplete and dropdown).

To configure the select width for all selects within a module according to unified display rules, use the `kbqSelectOptionsProvider`.

```ts
import { kbqSelectOptionsProvider } from '@koobiq/components/select';

@NgModule({
    providers: [
        kbqSelectOptionsProvider({ panelWidth: 'auto' })
    ]
})
```

##### Search in Select for short lists

You can configure a select so that the search is disabled when there is a small number of options. By default, this feature is turned off.
Use the `searchMinOptionsThreshold` attribute to configure it.

Possible values:

- `'auto'` – disables search if the number of options is less than 10 (default behavior).
- `<number>` – disables search if the number of options is less than the specified number.

To configure search disabling for all selects in a module with consistent display rules, you can use the `kbqSelectOptionsProvider` provider:

```ts
import { kbqSelectOptionsProvider } from '@koobiq/components/select';

@NgModule({
    providers: [
        kbqSelectOptionsProvider({ minOptionsThreshold: 'auto' })
    ]
})
```

### Customized selection

The select can contain preselected values.

<!-- example(select-preselected-values) -->

To make navigation easier, selected items can be pinned to the top of the list.

<!-- example(select-prioritized-selected) -->

### Optional icon

<!-- example(select-icon) -->

### Using cdk-virtual-scroll-viewport

Add `cdk-virtual-scroll-viewport` to your component template to display only visible elements and improve performance.

When option values are objects, provide a `virtualOptionFactory` that maps a value to a `KbqVirtualOption` carrying the display label (and optionally a per-value `disabled` state). The factory is used whenever the selected value's `KbqOption` is not currently rendered — virtual scroll recycled it out of the viewport, the value was set programmatically before its option was rendered, or the value is missing from the currently loaded data (server-side search). The same `KbqVirtualOption` powers the trigger label in single mode and tag labels in multiple mode.

Narrowing the data source down — a search field over the same array — keeps the selected value in the trigger even while its option is filtered out of the list.

<!-- example(select-virtual-scroll) -->

### Layering

By default, the dropdown menu appears above the horizontal [Navbar](/en/components/navbar) and [Topbar](/en/components/topbar), and above adjacent elements in other cases.

To prevent the menu from overlapping a required element during scrolling and instead have it hidden beneath it, adjust its position using a custom z-index or offset parameters.

<!-- example(select-scrolling-and-layering) -->

### Caption in options

<!-- example(select-two-line-option) -->

### Recommendations

- If you are using a select without a label, we suggest adding a placeholder to indicate what information the user should select. For example, “Country.”
- If there are more than 10 items in the list of values, then enable the search display in the select header. This will make it easier to find values.
