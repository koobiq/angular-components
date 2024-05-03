import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { KbqFileUploadModule } from '@koobiq/components/file-upload';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqButtonModule } from '@koobiq/components/button';
import { ReactiveFormsModule } from '@angular/forms';
import { KbqCheckboxModule } from '@koobiq/components/checkbox';

import { FileUploadMultipleCompactOverviewExample } from './file-upload-multiple-compact-overview/file-upload-multiple-compact-overview-example';
import { FileUploadMultipleDefaultOverviewExample } from './file-upload-multiple-default-overview/file-upload-multiple-default-overview-example';
import { FileUploadMultipleErrorOverviewExample } from './file-upload-multiple-error-overview/file-upload-multiple-error-overview-example';
import { FileUploadSingleErrorOverviewExample } from './file-upload-single-error-overview/file-upload-single-error-overview-example';
import { FileUploadSingleOverviewExample } from './file-upload-single-overview/file-upload-single-overview-example';
import { FileUploadMultipleCustomTextOverviewExample } from './file-upload-multiple-custom-text-overview/file-upload-multiple-custom-text-overview-example';
import { FileUploadIndeterminateLoadingOverviewExample } from './file-upload-indeterminate-loading-overview/file-upload-indeterminate-loading-overview-example';
import { FileUploadCvaOverviewExample } from './file-upload-cva-overview/file-upload-cva-overview-example';


export {
    FileUploadMultipleDefaultOverviewExample,
    FileUploadSingleOverviewExample,
    FileUploadSingleErrorOverviewExample,
    FileUploadMultipleErrorOverviewExample,
    FileUploadMultipleCompactOverviewExample,
    FileUploadMultipleCustomTextOverviewExample,
    FileUploadIndeterminateLoadingOverviewExample,
    FileUploadCvaOverviewExample
};

const EXAMPLES = [
    FileUploadMultipleDefaultOverviewExample,
    FileUploadSingleOverviewExample,
    FileUploadSingleErrorOverviewExample,
    FileUploadMultipleErrorOverviewExample,
    FileUploadMultipleCompactOverviewExample,
    FileUploadMultipleCustomTextOverviewExample,
    FileUploadIndeterminateLoadingOverviewExample,
    FileUploadCvaOverviewExample
];

@NgModule({
    imports: [
        CommonModule,
        ReactiveFormsModule,
        KbqFileUploadModule,
        KbqIconModule,
        KbqButtonModule,
        KbqCheckboxModule
    ],
    declarations: EXAMPLES,
    exports: EXAMPLES
})
export class FileUploadExamplesModule {}
