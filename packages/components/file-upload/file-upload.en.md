Allows the user to upload files to the product.

<!-- example(file-upload-single-overview) -->

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

By default, a selected folder is displayed in the list as a single item. For the multiple uploader, it can be configured so that after selecting a directory, all nested files appear in the list as separate items.

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
