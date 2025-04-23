The example demonstrates the localization capabilities of the component in place.

<!-- example(file-upload-multiple-custom-text-overview) -->

An example of file upload with indeterminate progress:

<!-- example(file-upload-indeterminate-loading-overview) -->

### Signals

An example of a file uploader using [`signal`](https://angular.dev/guide/signals).
After uploading, the file is highlighted as having an issue — this is a simulation of file processing.

<!-- example(file-upload-single-with-signal) -->

## Reactive Forms

An example of a file uploader using [`FormControl`](https://angular.dev/api/forms/FormControl).

### Validation: Additional Examples

#### Required Field

-   **Single File**: An example of a file uploader that ensures a file must be uploaded.
<!-- example(file-upload-single-required-reactive-validation) -->

-   **Multiple Files**: An example of a file uploader that requires multiple files to be uploaded.
<!-- example(file-upload-multiple-required-reactive-validation) -->

#### File Size Validation

The examples use [FileValidators](https://github.com/koobiq/angular-components/blob/main/packages/components/core/forms/validators.ts), a set of static methods for validating file upload fields.

-   **Single File**: An example of uploading a single file with Reactive Forms-based validation.
<!-- example(file-upload-single-validation-reactive-forms-overview) -->

-   **Multiple Files**: An example of uploading multiple files with Reactive Forms and built-in validation.
<!-- example(file-upload-multiple-default-validation-reactive-forms-overview) -->
