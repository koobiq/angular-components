<!-- example(tag-input-overview) -->

### Tag removal

Tag removal order:

- If there are selected tags, all of them will be removed.
- If there are no selected tags, the focused tag will be removed.

Tags can be removed in several ways:

- Click on the remove icon (`kbqTagRemove` directive) inside the tag.
- Press `Delete` or `Backspace` key.
- Programmatic removal through the component [API](/en/components/tag/api).

The removal option is configured using the `removable` attribute (enabled by default).

<!-- example(tag-input-removable) -->

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

<!-- example(tag-input-editable) -->

### Drag and drop

To enable tag reordering, you need to set the `draggable` property for `kbq-tag-list`.

<!-- example(tag-input-draggable) -->

### Keyboard navigation

#### Focus in empty input area

| <div style="min-width: 270px;">Key</div>                                                                                                                                                        | Action                                         |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------- |
| <span class="docs-hot-key-button">Backspace</span> / <span class="docs-hot-key-button">←</span> / <span class="docs-hot-key-button">Shift</span> + <span class="docs-hot-key-button">Tab</span> | Move focus to the last tag.                    |
| <span class="docs-hot-key-button">Ctrl</span> + <span class="docs-hot-key-button">A</span>                                                                                                      | Select all tags and set focus to the last one. |

#### Focus on tag

| <div style="min-width: 270px;">Key</div>                                                             | Action                           |
| ---------------------------------------------------------------------------------------------------- | -------------------------------- |
| <span class="docs-hot-key-button">←</span> / <span class="docs-hot-key-button">→</span>              | Move focus to previous/next tag. |
| <span class="docs-hot-key-button">Space</span>                                                       | Select/deselect tag.             |
| <span class="docs-hot-key-button">Delete</span> / <span class="docs-hot-key-button">Backspace</span> | Remove tag.                      |
| <span class="docs-hot-key-button">F2</span> / <span class="docs-hot-key-button">Enter</span>         | Start editing.                   |
| <span class="docs-hot-key-button">Ctrl</span> + <span class="docs-hot-key-button">A</span>           | Select all tags.                 |
| <span class="docs-hot-key-button">Home</span> / <span class="docs-hot-key-button">End</span>         | Move focus to first/last tag.    |

#### Tag editing mode

| <div style="min-width: 270px;">Key</div>       | Action          |
| ---------------------------------------------- | --------------- |
| <span class="docs-hot-key-button">Enter</span> | Save changes.   |
| <span class="docs-hot-key-button">Esc</span>   | Cancel changes. |
