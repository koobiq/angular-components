<!-- example(tag-overview) -->

Tags are used within the [`Tag list`](/en/components/tag-list) component in input fields to represent selected values: [`Select Multiple`](/en/components/select/overview#multiple-selection), [`Tag autocomplete`](/en/components/tag-autocomplete), [`Tag input`](/en/components/tag-input).

### Color

<!-- example(tag-fill-and-style) -->

### Disabled State

<!-- example(tag-disabled) -->

### Icon

<!-- example(tag-with-icon) -->

### “Remove” Button

Tags are most commonly used with a “Remove” button to allow users to delete a selected value from an input field. In some cases, tag removal should be disabled—when that’s the case, the close (×) icon should be hidden.

<!-- example(tag-with-remove-button) -->

### Long Text

Tag text does not wrap to a new line; instead, it is truncated with an ellipsis.

<!-- example(tag-long-text) -->

### Selection

Tags can be selected in several ways:

- Click on the tag or set focus on it.
- Programmatic selection through the component [API](/en/components/tag/api).

The selection option is configured using the `selectable` attribute (enabled by default).

<!-- example(tag-selectable) -->

### Removal

Tags can be removed in several ways:

- Click on the remove icon (`kbqTagRemove` directive) inside the tag.
- Press `Delete` or `Backspace` key.
- Programmatic removal through the component [API](/en/components/tag/api).

The removal option is configured using the `removable` attribute (enabled by default).

<!-- example(tag-removable) -->

### Editing

To enable editing mode, set the `editable` property for `kbq-tag`.

Entering edit mode:

- On double-click on the tag.
- On pressing `Enter` or `F2` key (when the tag is focused).

Saving changes:

- On pressing `Enter` key.
- On clicking the confirmation button (`kbqTagEditSubmit` directive).

Canceling changes:

- On pressing `Escape` key.
- On losing focus.

<!-- example(tag-editable) -->

#### Validation During Editing

Do not use tag editing when complex validation is expected. Editing is configured so that it's impossible to save a tag with an invalid value. To prevent saving, use the `preventEditSubmit` attribute.

<!-- example(tag-editable-with-validation) -->

### Recommendations

Use a [`Badge`](/en/components/badge) if you need a colored label in a table or key-value list. Tags should be used exclusively as tokens within input controls.
