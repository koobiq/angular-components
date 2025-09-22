### Custom input field

By default, inline editing uses the input from `KbqFormField`.
If you need to use a different input type while retaining inline-edit functionality, apply the `getValueHandler` and `setValueHandler` properties.

<!-- example(inline-edit-custom-handler) -->

### Clearing a field

- A text field can be cleared by deleting its content and saving.
- In a select component, provide an explicit option such as _“Not specified”_.
- For other controls, consider adding a dedicated **Clear** button.

If the field cannot accept an empty value, substitute either a default value or a valid fallback.

<!-- example(inline-edit-on-clean) -->

### Disabled or read-only state

When inline editing is disabled or in read-only mode, the element is displayed as static text.
If action menus are available, they remain accessible even in this state.

<!-- example(inline-edit-disabled) -->
