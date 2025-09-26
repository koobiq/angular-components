<!-- example(tag-list) -->

### Tag selection

Tags can be selected in several ways:

- Click on a tag or set focus on it (only in NON `multiple` mode, disabled by default).
- Click on a tag while holding `Ctrl` or `Shift`.
- Press `Ctrl+A` key combination (only in `multiple` mode, disabled by default).
- Programmatic selection through the component [API](/en/components/tag/api).

The selection option is configured using the `selectable` attribute (enabled by default).

<!-- example(tag-list-selectable) -->

### Tag removal

Tag removal order:

- If there are selected tags, all of them will be removed.
- If there are no selected tags, the focused tag will be removed.

Tags can be removed in several ways:

- Click on the remove icon (`kbqTagRemove` directive) inside the tag.
- Press `Delete` or `Backspace` key.
- Programmatic removal through the component [API](/en/components/tag/api).

The removal option is configured using the `removable` attribute (enabled by default).

<!-- example(tag-list-removable) -->

### Editing

To enable editing mode, you need to set the `editable` property for `kbq-tag-list` or individual `kbq-tag`.

Entering the mode:

- By double-clicking on the tag.
- By pressing the `Enter` or `F2` key (when focused on the tag).

Saving changes:

- By pressing the `Enter` key.
- By clicking the confirmation button (`kbqTagEditSubmit` directive).

Canceling changes:

- By pressing the `Escape` key.
- When losing focus.

<!-- example(tag-list-editable) -->
