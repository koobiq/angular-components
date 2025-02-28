`KbqSelect` - allows the user to select one or more values from a predefined list.

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

#### Dropdown list height

By default, the maximum height of the list is 256px. When there are many selections in the select-footer, the drop-down menu will appear scrolling.

You can customize the height if needed. For example, in a normal menu, 7-8 items are visible. If there are 10 options to choose from, you can increase the height of the list and show all the items without hiding a small part under the scroll.

<!-- example(select-height) -->

### Dropdown list width

By default, the width of the dropdown list is equal to select-height and it will increase when there is long text in the list. This behavior can be changed with the `panelWidth` attribute.

For a particular drop-down list:

<!-- example(select-with-panel-width-attribute) -->

For all drop-down lists in a module, using `kbqSelectOptionsProvider`:

```ts
import { kbqSelectOptionsProvider } from '@koobiq/components/select';

@NgModule({
    providers: [
        kbqSelectOptionsProvider({ panelWidth: 'auto' })
    ]
})
```

#### Optional icon

<!-- example(select-icon) -->

#### Customized selection

<!-- example(select-prioritized-selected) -->

#### Using cdk-virtual-scroll-viewport

Add `cdk-virtual-scroll-viewport` to your component template to display only visible elements and improve performance.

<!-- example(select-virtual-scroll) -->

### Recommendations

-   If you are using a select without a label, we suggest adding a placeholder to indicate what information the user should select. For example, “Country.”
-   If there are more than 10 items in the list of values, then enable the search display in the dropdown list header. This will make it easier to find values.
