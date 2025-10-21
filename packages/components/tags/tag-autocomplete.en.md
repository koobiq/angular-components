Tags Autocomplete is used to select one or multiple values from a list and to input custom values.

<!-- example(tag-autocomplete) -->

### Selection from dictionary

When focusing on the field, the dictionary menu opens. Autocomplete changes as you type. Selecting an option from the list adds a tag, clears the text in the field, and closes the menu.

<!-- example(tag-autocomplete-option-operations) -->

### Adding to dictionary

The option to create a new tag is placed first in the autocomplete menu. It creates a new token from the entered text if it doesn't exist in the dictionary.

Adding a tag also works with the **Tab** key.

Creating a duplicate of a selected tag is not allowed: the system will show the message **Nothing found**.

<!-- example(tag-autocomplete-option-operations) -->

### Tag removal

Tag removal order:

- If there are selected tags, all of them will be removed.
- If there are no selected tags, the focused tag will be removed.

Tags can be removed in several ways:

- Click on the remove icon (`kbqTagRemove` directive) inside the tag.
- Press `Delete` or `Backspace` key.
- Programmatic removal through the component [API](/en/components/tag/api).

The removal option is configured using the `removable` attribute (enabled by default).

### Tag selection

Tags can be selected in several ways:

- Click on a tag or set focus on it (only in NON `multiple` mode, disabled by default).
- Click on a tag while holding `Ctrl`.
- Press `Ctrl+A` key combination (only in `multiple` mode, disabled by default).
- `Space` when the tag is focused.
- Programmatic selection through the component [API](/en/components/tag/api).

The selection option is configured using the `selectable` attribute (enabled by default).

### Drag and drop

To enable tag reordering, you need to set the `draggable` property for `kbq-tag-list`.
