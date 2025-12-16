import { AsyncPipe, NgClass, NgTemplateOutlet } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { KbqButtonModule } from '@koobiq/components/button';
import { KbqDataSizePipe } from '@koobiq/components/core';
import { KbqEllipsisCenterModule } from '@koobiq/components/ellipsis-center';
import { KbqFormFieldModule } from '@koobiq/components/form-field';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqLinkModule } from '@koobiq/components/link';
import { KbqListModule } from '@koobiq/components/list';
import { KbqProgressSpinnerModule } from '@koobiq/components/progress-spinner';
import { KbqToolTipModule } from '@koobiq/components/tooltip';
import { KbqMultipleFileUploadComponent } from './multiple-file-upload.component';
import { KbqFileDropDirective } from './primitives';
import { KbqSingleFileUploadComponent } from './single-file-upload.component';

@NgModule({
    imports: [
        FormsModule,
        ReactiveFormsModule,
        KbqToolTipModule,
        KbqProgressSpinnerModule,
        KbqIconModule,
        KbqButtonModule,
        KbqListModule,
        KbqFormFieldModule,
        KbqEllipsisCenterModule,
        KbqDataSizePipe,
        KbqLinkModule,
        AsyncPipe,
        NgClass,
        NgTemplateOutlet,
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
