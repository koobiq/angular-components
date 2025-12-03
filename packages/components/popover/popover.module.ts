import {
    A11yModule,
    ConfigurableFocusTrapFactory,
    FOCUS_TRAP_INERT_STRATEGY,
    FocusTrapFactory
} from '@angular/cdk/a11y';
import { CdkObserveContent } from '@angular/cdk/observers';
import { OverlayModule } from '@angular/cdk/overlay';
import { NgClass, NgTemplateOutlet } from '@angular/common';
import { NgModule } from '@angular/core';
import { KbqButtonModule } from '@koobiq/components/button';
import { EmptyFocusTrapStrategy } from '@koobiq/components/core';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqPopoverConfirmComponent, KbqPopoverConfirmTrigger } from './popover-confirm.component';
import {
    KBQ_POPOVER_SCROLL_STRATEGY_FACTORY_PROVIDER,
    KbqPopoverComponent,
    KbqPopoverTrigger
} from './popover.component';

@NgModule({
    imports: [
        OverlayModule,
        KbqButtonModule,
        A11yModule,
        KbqIconModule,
        CdkObserveContent,
        NgClass,
        NgTemplateOutlet,
        KbqPopoverComponent,
        KbqPopoverTrigger,
        KbqPopoverConfirmComponent,
        KbqPopoverConfirmTrigger
    ],
    exports: [
        KbqPopoverComponent,
        KbqPopoverTrigger,
        KbqPopoverConfirmComponent,
        KbqPopoverConfirmTrigger
    ],
    providers: [
        KBQ_POPOVER_SCROLL_STRATEGY_FACTORY_PROVIDER,
        { provide: FocusTrapFactory, useClass: ConfigurableFocusTrapFactory },
        { provide: FOCUS_TRAP_INERT_STRATEGY, useClass: EmptyFocusTrapStrategy }]
})
export class KbqPopoverModule {}
