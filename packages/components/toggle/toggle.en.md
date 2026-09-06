**State toggle button:** on or off. For example, Wi-Fi is turned on or off on a phone.

<!-- example(toggle-overview) -->

### Properties

#### Disabled state

<!-- example(toggle-disabled) -->

#### Error

<!-- example(toggle-error) -->

#### Indeterminate state

This state is used to reflect partial selection or uncertainty.

<!-- example(toggle-indeterminate) -->

#### Loading

While loading, the toggle looks inactive, ignores clicks and reports itself as busy to assistive technology, but stays focusable.

<!-- example(toggle-loading) -->

#### Big

Use the `big` input to render the toggle with the enlarged typography of the label and the hint. The switch itself keeps its size.

### Content

##### Hint

<!-- example(toggle-with-hint) -->

##### Label on the left

The toggle is placed to the right of the field name and hint block. Use `labelPosition="left"` for this layout, the default value is `right`.

<!-- example(toggle-multiline) -->

The toggle can be placed to the right and on the same line after the label.

<!-- example(toggle-label-left) -->

### Accessibility

Without a visible label, describe the toggle with `aria-label` or point `aria-labelledby` at an existing caption. A projected `kbq-hint` is exposed as the description of the control and is not part of its name.

The `name` and `value` inputs are forwarded to the underlying `<input type="checkbox">`, so the toggle is serialized by native form submission.

### Recommendations

- Use a toggle for instant switching of settings that do not require confirmation. For example, changes are applied immediately without a “Save” button. If saving requires submitting a form, use a [checkbox](/en/components/checkbox).
- Do not use a toggle if the choice options do not fit binary logic: on or off, yes or no.
- Use `clickAction` (or the `KBQ_CHECKABLE_CLICK_ACTION` token for the whole application) to change what a click does: `check-indeterminate` is the default, `check` keeps the mixed state, and `noop` leaves the state to the application.
