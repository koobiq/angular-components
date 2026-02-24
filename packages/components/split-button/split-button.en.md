A split button combines several related actions into a single control. The primary action is immediately accessible, while additional options are hidden in a dropdown menu.

<!-- example(split-button-overview) -->

### Style

A split button follows the same visual variants as a regular [button](/en/components/button).

<!-- example(split-button-styles) -->

### Content

The primary action can be labeled with a caption and illustrated with an icon. In the variant without a caption, the menu button becomes narrower.

<!-- example(split-button-content) -->

Long text in the primary button does not wrap to a new line — it is truncated with an ellipsis. Avoid buttons with long text.

<!-- example(split-button-text-overflow) -->

### Disabled state

Either the primary or secondary action can be disabled individually, or the entire group can be disabled at once.

<!-- example(split-button-disabled-state) -->

### In progress

The Progress state can be combined with any other state (Normal, Disabled, Active). Like the Disabled state, it can be applied to the entire button group or to an individual element.

<!-- example(split-button-progress-state) -->

### Menu width matching the button

Menu positioning is configured the same way as in the [Dropdown](/en/components/dropdown) component. When the menu width is approximately equal to the split button's size, it is better to align them for visual consistency.

<!-- example(split-button-menu-width) -->

### Recommendations

A split button is often confused with the more common [button menu](/en/components/dropdown), which consists of a single element that opens a dropdown list of commands. Use a split button only in exceptional cases:

- **When there is a clear and frequently used primary action.** A split button is ideal when in 80% of cases the user needs one action (for example, "Save"), but occasionally needs to choose a different option.
- **The menu actions are homogeneous and closely related to the primary action.** All items in the dropdown list must be variations or refinements of the primary action.
