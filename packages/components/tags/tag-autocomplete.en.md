Tags Autocomplete is used to select one or multiple values from a list and to input custom values.

When focusing on the field, the dictionary menu opens. Autocomplete changes as you type. Selecting an option from the list adds a tag, clears the text in the field, and closes the menu.

<!-- example(tag-autocomplete-overview) -->

### Adding to dictionary

The option to create a new tag is placed first in the autocomplete menu. It creates a new token from the entered text if it doesn't exist in the dictionary.

Adding a tag also works with the `Tab` key.

Creating a duplicate of a selected tag is not allowed: the system will show the message `Nothing found`.

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

<!-- example(tag-autocomplete-removable) -->

### Tag selection

Tags can be selected in several ways:

- Click on a tag while holding `Ctrl`.
- Press `Ctrl+A` key combination.
- `Space` when the tag is focused.
- Programmatic selection through the component [API](/en/components/tag/api).

The selection option is configured using the `selectable` attribute (enabled by default).

### Editing

To enable editing mode, you need to set the `editable` property for `kbq-tag-list` or individual `kbq-tag`.

Enter editing mode:

- On double click on the tag.
- On pressing `Enter` or `F2` key (when tag is focused).

Save changes:

- On pressing `Enter` key.
- On clicking the confirmation button (`kbqTagEditSubmit` directive).

Cancel changes:

- On pressing `Escape` key.
- On focus loss.

In editing mode, the tag transforms into an input field and remains at the same position within the control.

<!-- example(tag-autocomplete-editable) -->

### Drag and drop

To enable tag reordering, you need to set the `draggable` property for `kbq-tag-list`.

<!-- example(tag-autocomplete-draggable) -->

### Keyboard navigation

#### Focus in empty input area

| <div style="min-width: 200px;">Key</div>                                                                                                                                                        | Action                                         |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------- |
| <span class="docs-hot-key-button">Backspace</span> / <span class="docs-hot-key-button">←</span> / <span class="docs-hot-key-button">Shift</span> + <span class="docs-hot-key-button">Tab</span> | Move focus to the last tag.                    |
| <span class="docs-hot-key-button">Ctrl</span> + <span class="docs-hot-key-button">A</span>                                                                                                      | Select all tags and set focus to the last one. |

#### Focus on tag

| <div style="min-width: 200px;">Key</div>                                                             | Action                           |
| ---------------------------------------------------------------------------------------------------- | -------------------------------- |
| <span class="docs-hot-key-button">←</span> / <span class="docs-hot-key-button">→</span>              | Move focus to previous/next tag. |
| <span class="docs-hot-key-button">Space</span>                                                       | Select/deselect tag.             |
| <span class="docs-hot-key-button">Delete</span> / <span class="docs-hot-key-button">Backspace</span> | Remove tag.                      |
| <span class="docs-hot-key-button">F2</span> / <span class="docs-hot-key-button">Enter</span>         | Start editing.                   |
| <span class="docs-hot-key-button">Ctrl</span> + <span class="docs-hot-key-button">A</span>           | Select all tags.                 |
| <span class="docs-hot-key-button">Home</span> / <span class="docs-hot-key-button">End</span>         | Move focus to first/last tag.    |

#### Tag editing mode

| <div style="min-width: 200px;">Key</div>       | Action          |
| ---------------------------------------------- | --------------- |
| <span class="docs-hot-key-button">Enter</span> | Save changes.   |
| <span class="docs-hot-key-button">Esc</span>   | Cancel changes. |
