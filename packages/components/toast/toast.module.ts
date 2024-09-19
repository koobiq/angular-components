import { A11yModule } from '@angular/cdk/a11y';
import { OverlayModule } from '@angular/cdk/overlay';
import { NgClass, NgTemplateOutlet } from '@angular/common';
import { NgModule } from '@angular/core';
import { KbqButtonModule } from '@koobiq/components/button';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqTitleModule } from '@koobiq/components/title';
import { KbqToastContainerComponent } from './toast-container.component';
import { KbqToastCloseButton, KbqToastComponent } from './toast.component';
import { KBQ_TOAST_FACTORY, KbqToastService } from './toast.service';

@NgModule({
    declarations: [
        KbqToastComponent,
        KbqToastContainerComponent,
        KbqToastCloseButton
    ],
    imports: [
        OverlayModule,
        KbqTitleModule,
        A11yModule,
        KbqIconModule,
        KbqButtonModule,
        NgTemplateOutlet,
        NgClass
    ],
    exports: [
        KbqToastComponent,
        KbqToastContainerComponent,
        KbqToastCloseButton
    ],
    providers: [
        KbqToastService,
        { provide: KBQ_TOAST_FACTORY, useFactory: () => KbqToastComponent }]
})
export class KbqToastModule {}
