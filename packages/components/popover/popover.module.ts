import { A11yModule, ConfigurableFocusTrapFactory, FocusTrapFactory } from '@angular/cdk/a11y';
import { OverlayModule } from '@angular/cdk/overlay';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { KbqButtonModule } from '@koobiq/components/button';
import { KbqPopoverConfirmComponent, KbqPopoverConfirmTrigger } from './popover-confirm.component';
import {
    KBQ_POPOVER_SCROLL_STRATEGY_FACTORY_PROVIDER,
    KbqPopoverComponent,
    KbqPopoverTrigger
} from './popover.component';
import { KbqIconModule } from '@koobiq/components/icon';

@NgModule({
    declarations: [KbqPopoverComponent, KbqPopoverTrigger, KbqPopoverConfirmComponent, KbqPopoverConfirmTrigger],
    exports: [KbqPopoverComponent, KbqPopoverTrigger, KbqPopoverConfirmComponent, KbqPopoverConfirmTrigger],
    imports: [CommonModule, OverlayModule, KbqButtonModule, A11yModule, KbqIconModule],
    providers: [
        KBQ_POPOVER_SCROLL_STRATEGY_FACTORY_PROVIDER,
        { provide: FocusTrapFactory, useClass: ConfigurableFocusTrapFactory }]
})
export class KbqPopoverModule {}
