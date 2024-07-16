import { A11yModule, ConfigurableFocusTrapFactory, FocusTrapFactory } from '@angular/cdk/a11y';
import { OverlayModule } from '@angular/cdk/overlay';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { KbqButtonModule } from '@koobiq/components/button';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqTitleModule } from '@koobiq/components/title';
import { CssUnitPipe } from './css-unit.pipe';
import { KbqModalControlService } from './modal-control.service';
import { KbqModalComponent } from './modal.component';
import { KbqModalBody, KbqModalFooter, KbqModalMainAction, KbqModalTitle } from './modal.directive';
import { KbqModalService } from './modal.service';

@NgModule({
    imports: [
        CommonModule,
        OverlayModule,
        A11yModule,
        KbqButtonModule,
        KbqIconModule,
        KbqTitleModule
    ],
    exports: [
        KbqModalComponent,
        KbqModalTitle,
        KbqModalBody,
        KbqModalFooter,
        KbqModalMainAction
    ],
    declarations: [
        KbqModalComponent,
        KbqModalTitle,
        KbqModalBody,
        KbqModalFooter,
        CssUnitPipe,
        KbqModalMainAction
    ],
    providers: [
        KbqModalControlService,
        KbqModalService,
        { provide: FocusTrapFactory, useClass: ConfigurableFocusTrapFactory }]
})
export class KbqModalModule {}
