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

### Accessibility

- **Grouping.** The host is announced as a `role="group"`: it ties the two actions together while each button stays a separate tab stop. When a page holds several split buttons, name the group — `<kbq-split-button aria-label="Save document">`.
- **Menu trigger.** The trigger is an icon-only button, so it carries no text and no accessible name of its own. Set one explicitly: `<button kbq-button aria-label="More options" [kbqDropdownTriggerFor]="menu">`.
- **Open state.** The trigger carries `aria-expanded`, so assistive technology announces whether the menu is currently open.
- **Keyboard.** `Tab` reaches the primary button and then the trigger, `Enter` and `Space` activate the focused one. On the trigger `ArrowDown` also opens the menu, and `Escape` closes it and returns focus to the trigger — the same model as in [Dropdown](/en/components/dropdown).
- **Disabled state.** A disabled button leaves the tab order and is announced as disabled: through the native `disabled` attribute on a `<button>` host, and through `aria-disabled` on hosts without native support, such as `<a>`.

### Recommendations

A split button is often confused with the more common [button menu](/en/components/dropdown), which consists of a single element that opens a dropdown list of commands. Use a split button only in exceptional cases:

- **When there is a clear and frequently used primary action.** A split button is ideal when in 80% of cases the user needs one action (for example, "Save"), but occasionally needs to choose a different option.
- **The menu actions are homogeneous and closely related to the primary action.** All items in the dropdown list must be variations or refinements of the primary action.
