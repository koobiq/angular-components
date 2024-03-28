import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { KbqButtonModule } from '@koobiq/components/button';
import { KbqDataSizeModule } from '@koobiq/components/core';
import { KbqEllipsisCenterModule } from '@koobiq/components/ellipsis-center';
import { KbqFormFieldModule } from '@koobiq/components/form-field';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqListModule } from '@koobiq/components/list';
import { KbqProgressSpinnerModule } from '@koobiq/components/progress-spinner';
import { KbqToolTipModule } from '@koobiq/components/tooltip';

import { KbqFileDropDirective } from './file-drop';
import { KbqMultipleFileUploadComponent } from './multiple-file-upload.component';
import { KbqSingleFileUploadComponent } from './single-file-upload.component';
import { KbqLinkModule } from '@koobiq/components/link';


@NgModule({
    imports: [
        CommonModule,
        KbqToolTipModule,
        KbqProgressSpinnerModule,
        KbqIconModule,
        KbqButtonModule,
        KbqListModule,
        KbqFormFieldModule,
        KbqEllipsisCenterModule,
        KbqDataSizeModule,
        KbqLinkModule
    ],
    declarations: [
        KbqFileDropDirective,
        KbqSingleFileUploadComponent,
        KbqMultipleFileUploadComponent
    ],
    exports: [
        KbqSingleFileUploadComponent,
        KbqMultipleFileUploadComponent,
        KbqFileDropDirective
    ]
})
export class KbqFileUploadModule {}
