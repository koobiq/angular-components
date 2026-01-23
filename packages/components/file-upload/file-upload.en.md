[//]: # '"@TODO remove or update"'
[//]: # '"<!-- example(file-upload-single-error-overview) -->"'
[//]: # '"<!-- example(file-upload-multiple-error-overview) -->"'

Allows the user to upload files to the product.

<!-- example(file-upload-single-overview) -->

### Multiple upload

Multiple files can be dragged into the upload area or selected via the system dialog.

<!-- example(file-upload-multiple-default-overview) -->

#### Compact variant

<!-- example(file-upload-multiple-compact-overview) -->

### File size

When uploading multiple files, their size is always shown in the list. In the single-file uploader, displaying this parameter is configured separately.

[//]: # '"@TODO example"'

### Icon for the selected file

Selected files can have a custom icon configured. For example, for images.

[//]: # '"@TODO example"'

### Selecting folders or files

The component can be configured to allow selecting only files, only folders, or both files and folders.

<!-- example(file-upload-allowed) -->

By default, the selected folder is shown in the list as a single item. For the multiple uploader, it can be configured so that after selecting a directory, all nested files appear in the list as separate items.

### Disabled state

In the disabled state, the component does not receive focus and drag-and-drop interaction does not work.

[//]: # '"@TODO example"'

### Error

<!-- example(file-upload-multiple-error-overview) -->

When an invalid file is selected, only the corresponding item in the list receives the error state, not the entire component. Error messages are displayed below the uploader.

[//]: # '"@TODO update example"'

### Height of the selected items list

By default, the component grows in height when many files are selected. However, a maximum height can be configured, after which scrolling appears.

[//]: # '"@TODO example"'

It is also possible to set a fixed height for the uploader.

[//]: # '"@TODO example"'

### Fullscreen file uploader

The user can drag files onto the page, at which point a fullscreen upload overlay will be displayed.

[//]: # '"@TODO example"'

### Upload area

The drag-and-drop area can be not only the entire screen or the File Upload component itself in a form, but also a specific part of the screen.

[//]: # '"@TODO example"'
