import { OverlayModule } from '@angular/cdk/overlay';
import { AsyncPipe, NgClass, TitleCasePipe } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { KbqBadgeModule } from '@koobiq/components/badge';
import { KbqButtonModule } from '@koobiq/components/button';
import { KbqHighlightModule } from '@koobiq/components/core';
import { KbqDlModule } from '@koobiq/components/dl';
import { KbqEmptyStateModule } from '@koobiq/components/empty-state';
import { KbqFormFieldModule } from '@koobiq/components/form-field';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqInputModule } from '@koobiq/components/input';
import { KbqModalModule } from '@koobiq/components/modal';
import { KbqSelectModule } from '@koobiq/components/select';
import { KbqToastModule, KbqToastService } from '@koobiq/components/toast';
import { KbqToolTipModule } from '@koobiq/components/tooltip';
import { IconItems } from 'src/app/components/icons-items/icon-items';
import { AnchorsModule } from '../../components/anchors/anchors.module';
import { IconPreviewModalComponent } from './icon-preview-modal/icon-preview-modal.component';
import { IconsViewerComponent } from './icons-viewer.component';

@NgModule({
    imports: [
        OverlayModule,
        FormsModule,
        ReactiveFormsModule,
        RouterModule,
        KbqButtonModule,
        KbqDlModule,
        KbqFormFieldModule,
        KbqHighlightModule,
        KbqIconModule,
        KbqInputModule,
        KbqModalModule,
        KbqBadgeModule,
        KbqToolTipModule,
        KbqToastModule,
        KbqSelectModule,
        KbqButtonModule,
        AnchorsModule,
        KbqEmptyStateModule,
        NgClass,
        AsyncPipe,
        TitleCasePipe
    ],
    exports: [
        IconsViewerComponent,
        IconPreviewModalComponent
    ],
    declarations: [
        IconsViewerComponent,
        IconPreviewModalComponent
    ],
    providers: [IconItems, KbqToastService]
})
export class IconsViewerModule {}
