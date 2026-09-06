Allows the user to upload files to the product.

<!-- example(file-upload-overview) -->

### Multiple upload

Multiple files can be dragged into the upload area or selected via the system dialog.

<!-- example(file-upload-multiple-default-overview) -->

#### Compact variant

For the multiple uploader, a compact view is available when it is empty.

<!-- example(file-upload-multiple-compact-overview) -->

### File size

When uploading multiple files, their size is always shown in the list. For the single uploader, displaying the file size is configured separately.

<!-- example(file-upload-single-with-size) -->

### Icon for selected file

Selected files can be configured with a custom icon, for example, for images.

<!-- example(file-upload-multiple-with-custom-icon) -->

### Selecting folders or files

The component can be configured to allow selecting only files, only folders, or both files and folders.

<!-- example(file-upload-allowed) -->

### Disabled state

In the disabled state, the component does not receive focus and drag-and-drop functionality does not work.

<!-- example(file-upload-multiple-disabled) -->

### Error

<!-- example(file-upload-multiple-error) -->

When an invalid file is selected, only the corresponding item in the list receives the error state, not the entire component. Error messages are displayed below the uploader.

<!-- example(file-upload-multiple-error-filled) -->

### Height of the selected items list

By default, the component grows in height when many files are selected. However, you can set a maximum height, after which scrolling will appear.

<!-- example(file-upload-multiple-with-max-height) -->

It is also possible to set a fixed height for the uploader.

<!-- example(file-upload-multiple-with-fixed-height) -->

### Full-screen file uploader

The user can drag files onto the page, and at that moment a full-screen upload overlay will be shown.

<!-- example(file-upload-dropzone) -->

### Upload area

The drag-and-drop area can be not only the entire screen or the File Upload component itself within a form, but also a separate part of the screen.

<!-- example(file-upload-local-dropzone) -->

### Adding files

By default, every new selection is added to the files you already have — this makes it easy to build up a list over several picks.

If you want a new selection to replace the previous one instead — the way a regular system file dialog works — use `addStrategy="replace"`.

<!-- example(file-upload-multiple-add-strategy) -->

### Accepted file types

`accept` is forwarded to the `accept` attribute of the native file input, exactly like the platform one: it filters what the operating system dialog offers, and nothing more. The user can still switch the dialog to "All files", and a dragged file never meets it at all.

To reject a file, validate the control. `FileValidators.isCorrectExtension` takes the same list, so both can be fed from one field, and the rejected file lands in the list with an error message the user can read — see the validation examples on the Examples tab.

A selection the component itself discards is reported through `(rejected)`: files past the first for the single uploader, and duplicates of files already in the list for the multiple one with the default `concat` strategy.

### Accessibility and keyboard

The tab order is the browse link, then the remove control of every selected file, in list order. `Delete` and `Backspace` remove the file whose control has focus; after a removal focus moves to the control that took its place, or to the file input when the list is empty.

Projected `kbq-hint` messages are linked to the file input through `aria-describedby`, and the input carries `aria-invalid` while the control is in an error state. Additions and removals are announced in a live region owned by the component; the wording follows the active locale and can be overridden through `KBQ_LOCALE_DATA`.
