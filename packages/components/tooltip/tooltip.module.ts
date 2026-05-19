import { NgModule } from '@angular/core';
import {
    KBQ_TOOLTIP_OPEN_TIME_PROVIDER,
    KBQ_TOOLTIP_SCROLL_STRATEGY_FACTORY_PROVIDER,
    KbqTooltipComponent,
    KbqTooltipTrigger
} from './tooltip.component';

const COMPONENTS = [
    KbqTooltipComponent,
    KbqTooltipTrigger
];

@NgModule({
    imports: COMPONENTS,
    exports: COMPONENTS,
    providers: [
        KBQ_TOOLTIP_SCROLL_STRATEGY_FACTORY_PROVIDER,
        KBQ_TOOLTIP_OPEN_TIME_PROVIDER
    ]
})
export class KbqToolTipModule {}
