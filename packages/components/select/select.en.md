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

#### Additional options

If needed, the select width can be set to match the select width exactly. To do this, use the `panelWidth` attribute with the value `auto`.

<!-- example(select-with-panel-width-auto) -->

To set a fixed width of 400px for the select, use the `panelWidth` attribute with the value `400`.

<!-- example(select-with-panel-width-fixed) -->

To configure the select width for all selects within a module according to unified display rules, use the `kbqSelectOptionsProvider`.

```ts
import { kbqSelectOptionsProvider } from '@koobiq/components/select';

@NgModule({
    providers: [
        kbqSelectOptionsProvider({ panelWidth: 'auto' })
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

<!-- example(select-virtual-scroll) -->

### Recommendations

- If you are using a select without a label, we suggest adding a placeholder to indicate what information the user should select. For example, “Country.”
- If there are more than 10 items in the list of values, then enable the search display in the select header. This will make it easier to find values.
