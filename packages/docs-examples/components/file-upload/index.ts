import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { KbqFileUploadModule } from '@koobiq/components/file-upload';
import { KbqIconModule } from '@koobiq/components/icon';

import { FileUploadMultipleCompactOverviewExample } from './file-upload-multiple-compact-overview/file-upload-multiple-compact-overview-example';
import { FileUploadMultipleDefaultOverviewExample } from './file-upload-multiple-default-overview/file-upload-multiple-default-overview-example';
import { FileUploadMultipleErrorOverviewExample } from './file-upload-multiple-error-overview/file-upload-multiple-error-overview-example';
import { FileUploadSingleErrorOverviewExample } from './file-upload-single-error-overview/file-upload-single-error-overview-example';
import { FileUploadSingleOverviewExample } from './file-upload-single-overview/file-upload-single-overview-example';


export {
    FileUploadMultipleDefaultOverviewExample,
    FileUploadSingleOverviewExample,
    FileUploadSingleErrorOverviewExample,
    FileUploadMultipleErrorOverviewExample,
    FileUploadMultipleCompactOverviewExample
};

const EXAMPLES = [
    FileUploadMultipleDefaultOverviewExample,
    FileUploadSingleOverviewExample,
    FileUploadSingleErrorOverviewExample,
    FileUploadMultipleErrorOverviewExample,
    FileUploadMultipleCompactOverviewExample
];

@NgModule({
    imports: [
        CommonModule,
        KbqFileUploadModule,
        KbqIconModule
    ],
    declarations: EXAMPLES,
    exports: EXAMPLES
})
export class FileUploadExamplesModule {}
