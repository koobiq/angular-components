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

### Tag selection

Tags can be selected in several ways:

- Click on a tag while holding `Ctrl` or `Shift`.
- Press `Ctrl+A` key combination.
- Programmatic selection through the component [API](/en/components/tag/api).

Selection option is configured using the `selectable` attribute (enabled by default) and the `multiple` attribute (disabled by default).

### Tag removal

Tags can be removed in several ways:

- Click on the remove icon (`kbqTagRemove` directive).
- Press `Delete` or `Backspace` key.
- Programmatic removal through the component [API](/en/components/tag/api).

Removal option is configured using the `removable` attribute (enabled by default).
