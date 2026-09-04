Tags Autocomplete is used to select one or multiple values from a list and to input custom values.

When focusing on the field, the dictionary menu opens. Autocomplete changes as you type. Selecting an option from the list adds a tag, clears the text in the field, and closes the menu.

<!-- example(tag-autocomplete-overview) -->

The menu belongs to [autocomplete](en/components/autocomplete) — its width is configured there, through the `panelWidth` and `panelMinWidth` attributes of `<kbq-autocomplete>`, and is measured against the whole field rather than the input.

### Search

Search splits a multi-word query into parts and searches for them independently, trims leading and trailing spaces, is case-insensitive, and folds diacritics. The algorithm is described in the [Smart search guide](/en/other/search-smart).

<!-- example(tag-autocomplete-search) -->

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
- Click on a tag while holding `Shift` to change the selection range from the anchor tag to the clicked tag.
- Press `Shift` + `←` / `→` to expand or shrink the range.
- Press `Ctrl+A` key combination.
- `Space` when the tag is focused.
- Programmatic selection through the component [API](/en/components/tag/api).

Pointer and keyboard interactions change the same range relative to its initial tag. When the range shrinks, tags outside it are deselected. Disabled tags remain unchanged.

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

### Validation

Validators belong on `<kbq-tag-list>`: the tag list is the form control for the whole set of tags, while the input is only a text entry helper.

A `[formControl]` or `[ngModel]` of its own on `<input kbqTagInputFor>` is still required here: `kbqAutocomplete` drives the input through it, and without it panel filtering and typed-text tracking break. The library simply does not consider validators attached to that control.

The control value is the array of tags, so a single set of validators covers both the number of tags and the content of each one. Validation applies equally to tags picked from the autocomplete panel, typed by hand and pasted from the clipboard.

Validators do not prevent a tag from being added: the tag is added and the field goes into the error state. To keep an invalid value out of the list, filter it in the `(kbqTagInputTokenEnd)` and `(optionSelected)` handlers.

When the error becomes visible is controlled by [ErrorStateMatcher](/en/other/validation), and by default happens once the control is invalid and either touched or the form has been submitted.

<!-- example(tag-autocomplete-with-form-control-validators) -->

### Keyboard navigation

#### Focus in empty input area

| <div style="min-width: 270px;">Key</div>                                                                                                                                                        | Action                                         |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------- |
| <span class="docs-hot-key-button">Backspace</span> / <span class="docs-hot-key-button">←</span> / <span class="docs-hot-key-button">Shift</span> + <span class="docs-hot-key-button">Tab</span> | Move focus to the last tag.                    |
| <span class="docs-hot-key-button">Ctrl</span> + <span class="docs-hot-key-button">A</span>                                                                                                      | Select all tags and set focus to the last one. |

#### Focus on tag

| <div style="min-width: 270px;">Key</div>                                                                                                 | Action                           |
| ---------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------- |
| <span class="docs-hot-key-button">←</span> / <span class="docs-hot-key-button">→</span>                                                  | Move focus to previous/next tag. |
| <span class="docs-hot-key-button">Shift</span> + <span class="docs-hot-key-button">←</span> / <span class="docs-hot-key-button">→</span> | Change the range and move focus. |
| <span class="docs-hot-key-button">Space</span>                                                                                           | Select/deselect tag.             |
| <span class="docs-hot-key-button">Delete</span> / <span class="docs-hot-key-button">Backspace</span>                                     | Remove tag.                      |
| <span class="docs-hot-key-button">F2</span> / <span class="docs-hot-key-button">Enter</span>                                             | Start editing.                   |
| <span class="docs-hot-key-button">Ctrl</span> + <span class="docs-hot-key-button">A</span>                                               | Select all tags.                 |
| <span class="docs-hot-key-button">Home</span> / <span class="docs-hot-key-button">End</span>                                             | Move focus to first/last tag.    |

#### Tag editing mode

| <div style="min-width: 270px;">Key</div>       | Action          |
| ---------------------------------------------- | --------------- |
| <span class="docs-hot-key-button">Enter</span> | Save changes.   |
| <span class="docs-hot-key-button">Esc</span>   | Cancel changes. |
