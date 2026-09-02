Tag Input lets users enter multiple values as tags and supports keyboard navigation, selection, and removal.

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

<!-- example(tag-input-editable) -->

### Drag and drop

To enable tag reordering, you need to set the `draggable` property for `kbq-tag-list`.

<!-- example(tag-input-draggable) -->

### Separators

By default, a tag is created on `Enter`. Additional separator keys are set via `kbqTagInputSeparatorKeyCodes` and apply both while typing and when pasting from the clipboard.

If a separator should only apply on paste (e.g. a space, which is a common character inside a tag), mark it with `appliesTo: ['paste']`. Separators without a `key` (e.g. `/\s+/` for any run of whitespace) are paste-only by default, since no keystroke can ever match them.

Application- or module-wide defaults are set via `kbqTagsDefaultOptionsProvider`:

```ts
import { ENTER } from '@koobiq/components/core';
import { kbqTagsDefaultOptionsProvider } from '@koobiq/components/tags';

@NgModule({
    providers: [
        kbqTagsDefaultOptionsProvider({
            separatorKeyCodes: [ENTER],
            separators: [
                { symbol: /\r?\n/, key: 'Enter', keyCode: ENTER, appliesTo: ['input', 'paste'] },
                { symbol: /\s+/, appliesTo: ['paste'] } // paste-only — splits on any whitespace
            ]
        })
    ]
})
```

### Validation

Validators belong on `<kbq-tag-list>`, not on `<input kbqTagInputFor>`: the tag list is the form control for the whole set of tags, while the input is only a text entry helper. Bind `[formControl]`, `[formControlName]` or `[ngModel]` to `<kbq-tag-list>`.

The control value is the array of tags, so a single set of validators covers both the number of tags and the content of each one.

Validators do not prevent a tag from being added: the tag is added and the field goes into the error state — the same way for typing and for pasting from the clipboard. To keep an invalid value out of the list, filter it in the `(kbqTagInputTokenEnd)` handler, which is called for every tag being created regardless of its source.

When the error becomes visible is controlled by [ErrorStateMatcher](/en/other/validation), and by default happens once the control is invalid and touched.

<!-- example(tag-input-with-form-control-validators) -->

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
