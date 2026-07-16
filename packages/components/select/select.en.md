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

#### Grouping values

<!-- example(select-groups) -->

#### Filling a list of values

##### List with search

Use search when the list has more than 10 items.

Search can be by first character or full match, depending on the specific task and user preferences.

<!-- example(select-search) -->

##### Footer List

If additional controls need to be arranged, you can enable the display of a footer. You can display various auxiliary controls in the footer: buttons, links, tooltips.

<!-- example(select-footer) -->

#### Select height

By default, the maximum height of the list is 256px. When there are many selections in the select-footer, the drop-down menu will appear scrolling.

You can customize the height if needed. For example, in a normal menu, 7-8 items are visible. If there are 10 options to choose from, you can increase the height of the list and show all the items without hiding a small part under the scroll.

<!-- example(select-height) -->

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

When option values are objects, provide a `virtualOptionFactory` that maps a value to a `KbqVirtualOption` carrying the display label (and optionally a per-value `disabled` state). The factory is used whenever the selected value's `KbqOption` is not currently rendered — virtual scroll recycled it out of the viewport, or the value was set programmatically before its option was rendered. The same `KbqVirtualOption` powers the trigger label in single mode and tag labels in multiple mode.

<!-- example(select-virtual-scroll) -->

### Layering

By default, the dropdown menu is hidden beneath the horizontal [Navbar](/en/components/navbar) and [Topbar](/en/components/topbar) in other cases, it appears above adjacent elements.

To prevent the menu from overlapping a required element during scrolling and instead have it hidden beneath it, adjust its position using a custom z-index or offset parameters.

<!-- example(select-scrolling-and-layering) -->

### Caption in options

<!-- example(select-two-line-option) -->

### Recommendations

- If you are using a select without a label, we suggest adding a placeholder to indicate what information the user should select. For example, “Country.”
- If there are more than 10 items in the list of values, then enable the search display in the select header. This will make it easier to find values.
