### Component Localization

Deriving `[localeOverrides]` from the active locale keeps custom labels following `setLocale()`. To change them across the whole application instead, register them as locale data through `KBQ_LOCALE_DATA` in the root providers, where `KbqLocaleService` reads it.

<!-- example(file-upload-multiple-custom-text-overview) -->

Binding `[localeOverrides]` changes only the labels you pass, for that one component. The rest stay as they are and keep following the selected language. The value is keyed by locale section, so the labels go under `fileUpload.single` or `fileUpload.multiple`.

<!-- example(file-upload-custom-text-via-input) -->

### Indeterminate progress indicator

An example of file upload with indeterminate progress:

<!-- example(file-upload-indeterminate-loading-overview) -->

### Signals

An example of a file uploader using [`signal`](https://angular.dev/guide/signals).
After uploading, the file is highlighted as having an issue — this is a simulation of file processing.

<!-- example(file-upload-single-with-signal) -->

## Reactive forms

An example of a file uploader using [`FormControl`](https://angular.dev/api/forms/FormControl).

### Validation: additional examples

The examples use [FileValidators](https://github.com/koobiq/angular-components/blob/main/packages/components/core/forms/validators.ts), a set of static methods for validating file upload fields.

#### Required field

- **Single File**: An example of a file uploader that ensures a file must be uploaded.

<!-- example(file-upload-single-required-reactive-validation) -->

- **Multiple Files**: An example of a file uploader that requires multiple files to be uploaded.

<!-- example(file-upload-multiple-required-reactive-validation) -->

#### File size validation

- **Single File**: An example of uploading a single file with Reactive Forms-based validation.

<!-- example(file-upload-single-validation-reactive-forms-overview) -->

- **Multiple Files**: An example of uploading multiple files with Reactive Forms and built-in validation.

<!-- example(file-upload-multiple-default-validation-reactive-forms-overview) -->

#### File type or extension validation

- **Single file**: example of uploading a single file using `Reactive Forms` with validation.

<!-- example(file-upload-single-accept-validation) -->

- **Multiple files**: Example of uploading multiple files using `Reactive Forms` with validation.

<!-- example(file-upload-multiple-accept-validation) -->

#### Mixed validation: required and extension

- **Single file**: example of uploading a single file using `Reactive Forms` with validation.

<!-- example(file-upload-single-mixed-validation) -->

- **Multiple files**: Example of uploading multiple files using `Reactive Forms` with validation.

<!-- example(file-upload-multiple-mixed-validation) -->

#### Asynchronous validation

- Example of content check while uploading a single file using `Reactive Forms`.

<!-- example(file-upload-single-async-validation) -->

### Primitives

This example demonstrates the use of file upload component primitives.

<!-- example(file-upload-primitive) -->

### Dropzone

<!-- example(file-upload-dropzone) -->
