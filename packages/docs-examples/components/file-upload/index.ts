import { NgModule } from '@angular/core';
import { FileUploadCvaOverviewExample } from './file-upload-cva-overview/file-upload-cva-overview-example';
import { FileUploadIndeterminateLoadingOverviewExample } from './file-upload-indeterminate-loading-overview/file-upload-indeterminate-loading-overview-example';
import { FileUploadMultipleAcceptValidationExample } from './file-upload-multiple-accept-validation/file-upload-multiple-accept-validation-example';
import { FileUploadMultipleCompactOverviewExample } from './file-upload-multiple-compact-overview/file-upload-multiple-compact-overview-example';
import { FileUploadMultipleCustomTextOverviewExample } from './file-upload-multiple-custom-text-overview/file-upload-multiple-custom-text-overview-example';
import { FileUploadMultipleDefaultOverviewExample } from './file-upload-multiple-default-overview/file-upload-multiple-default-overview-example';
import { FileUploadMultipleDefaultValidationReactiveFormsOverviewExample } from './file-upload-multiple-default-validation-reactive-forms-overview/file-upload-multiple-default-validation-reactive-forms-overview-example';
import { FileUploadMultipleErrorOverviewExample } from './file-upload-multiple-error-overview/file-upload-multiple-error-overview-example';
import { FileUploadMultipleRequiredReactiveValidationExample } from './file-upload-multiple-required-reactive-validation/file-upload-multiple-required-reactive-validation-example';
import { FileUploadSingleAcceptValidationExample } from './file-upload-single-accept-validation/file-upload-single-accept-validation-example';
import { FileUploadSingleErrorOverviewExample } from './file-upload-single-error-overview/file-upload-single-error-overview-example';
import { FileUploadSingleOverviewExample } from './file-upload-single-overview/file-upload-single-overview-example';
import { FileUploadSingleRequiredReactiveValidationExample } from './file-upload-single-required-reactive-validation/file-upload-single-required-reactive-validation-example';
import { FileUploadSingleValidationReactiveFormsOverviewExample } from './file-upload-single-validation-reactive-forms-overview/file-upload-single-validation-reactive-forms-overview-example';
import { FileUploadSingleWithSignalExample } from './file-upload-single-with-signal/file-upload-single-with-signal-example';

export {
    FileUploadCvaOverviewExample,
    FileUploadIndeterminateLoadingOverviewExample,
    FileUploadMultipleAcceptValidationExample,
    FileUploadMultipleCompactOverviewExample,
    FileUploadMultipleCustomTextOverviewExample,
    FileUploadMultipleDefaultOverviewExample,
    FileUploadMultipleDefaultValidationReactiveFormsOverviewExample,
    FileUploadMultipleErrorOverviewExample,
    FileUploadMultipleRequiredReactiveValidationExample,
    FileUploadSingleAcceptValidationExample,
    FileUploadSingleErrorOverviewExample,
    FileUploadSingleOverviewExample,
    FileUploadSingleRequiredReactiveValidationExample,
    FileUploadSingleValidationReactiveFormsOverviewExample,
    FileUploadSingleWithSignalExample
};

const EXAMPLES = [
    FileUploadSingleErrorOverviewExample,
    FileUploadMultipleErrorOverviewExample,
    FileUploadSingleOverviewExample,
    FileUploadCvaOverviewExample,
    FileUploadSingleValidationReactiveFormsOverviewExample,
    FileUploadMultipleDefaultValidationReactiveFormsOverviewExample,
    FileUploadMultipleDefaultOverviewExample,
    FileUploadMultipleCustomTextOverviewExample,
    FileUploadIndeterminateLoadingOverviewExample,
    FileUploadMultipleCompactOverviewExample,
    FileUploadSingleRequiredReactiveValidationExample,
    FileUploadMultipleRequiredReactiveValidationExample,
    FileUploadSingleWithSignalExample,
    FileUploadSingleAcceptValidationExample,
    FileUploadMultipleAcceptValidationExample
];

@NgModule({
    imports: EXAMPLES,
    exports: EXAMPLES
})
export class FileUploadExamplesModule {}
