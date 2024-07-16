import { OverlayModule } from '@angular/cdk/overlay';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import {
    KBQ_TOOLTIP_OPEN_TIME_PROVIDER,
    KBQ_TOOLTIP_SCROLL_STRATEGY_FACTORY_PROVIDER,
    KbqExtendedTooltipTrigger,
    KbqTooltipComponent,
    KbqTooltipTrigger,
    KbqWarningTooltipTrigger
} from './tooltip.component';

@NgModule({
    declarations: [
        KbqTooltipComponent,
        KbqTooltipTrigger,
        KbqExtendedTooltipTrigger,
        KbqWarningTooltipTrigger
    ],
    exports: [
        KbqTooltipComponent,
        KbqTooltipTrigger,
        KbqExtendedTooltipTrigger,
        KbqWarningTooltipTrigger
    ],
    imports: [CommonModule, OverlayModule],
    providers: [
        KBQ_TOOLTIP_SCROLL_STRATEGY_FACTORY_PROVIDER,
        KBQ_TOOLTIP_OPEN_TIME_PROVIDER
    ]
})
export class KbqToolTipModule {}
