### Component Localization

Configuring text via `InjectionToken` changes the labels in all file upload components within the module at once.

<!-- example(file-upload-multiple-custom-text-overview) -->

Configuring text via the input property `[localeConfig]` allows you to change only the required labels. The rest will remain as default and will change depending on the selected language, if such behavior is provided.

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

### Primitives

This example demonstrates the use of file upload component primitives.

<!-- example(file-upload-primitive) -->
