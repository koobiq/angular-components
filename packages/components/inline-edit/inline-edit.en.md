Inline editing can replace a traditional form when the user only needs to update a few fields among many available parameters.

### Vertical list

<!-- example(inline-edit-vertical-list) -->

### Horizontal list

In a horizontal list, you can adjust the column width of the parameter name and set it to either a fixed or relative value.

<!-- example(inline-edit-horizontal-list) -->

### Without labels

<!-- example(inline-edit-without-label) -->

### Input controls

<!-- example(inline-edit-controls) -->

### Empty state

Parameters should never appear as blank in view mode. Instead, use placeholder text to signal that a field can be edited.

By default, the system displays _“Not filled”_, but it’s better to use contextual messages for clarity. Examples:

- _Responsible: Not assigned_
- _End date: Not specified_

For fields without labels, the placeholder can include the field name, e.g., _Description: Not provided_, _Operator: Not set_, _Incident type: Not defined_.

<!-- example(inline-edit-unfilled) -->

### Validation

Exiting edit mode attempts to save changes. If the new value is invalid, the system displays an error message, highlights the field, and keeps focus in the input.

When certain characters are always invalid (e.g., letters in an IP address), block their input directly. Prevented characters do not appear, and a yellow tooltip explains why.

If the user clears a value, you can substitute either a default value or the last valid entry to avoid errors.

<!-- example(inline-edit-validation) -->

### Action menu

On hover or focus, an action button or menu can appear on the right side of the field, offering options such as:

- Copy text
- Add value to filter
- Clear field
- Fill from template

These actions are visually separated from the main value and placed in the top-right corner. When the menu is open, both the highlight and the icon remain visible.

<!-- example(inline-edit-menu) -->

### Usage examples

#### Editable header

<!-- example(inline-edit-editable-header) -->

#### Content alignment

Inline-editable elements should remain aligned with their appearance in view mode. Do not account for extra padding or spacing that may appear when the element is hovered, focused, or in edit mode.

<!-- example(inline-edit-content-alignment) -->

#### Custom design

<!-- example(inline-edit-customized-design) -->

### Recommendations

Inline edits should be saved immediately after a change—without requiring a global **Save** button.

**Avoid using inline editing when:**

- Inside traditional forms.
- Creating new entities (use a form instead).
- Fields require complex validation (e.g., password, email, uniqueness checks, input masks, or guided hints).
- Fields are dependent on each other (use a form when one change affects others).
- Editing critical or sensitive data.
- Saving requires additional confirmation (e.g., “Are you sure?” dialogs).

**Alternatives to inline editing:**

- A modal or popover with a form — for complex or multi-line data.
- A dedicated edit page — when more control over input is required.
- An inline form — when the field should expand into a larger editor.
