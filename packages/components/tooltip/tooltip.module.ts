import { NgModule } from '@angular/core';
import { KBQ_TOOLTIP_OPEN_TIME_PROVIDER, KbqTooltipComponent, KbqTooltipTrigger } from './tooltip.component';

const COMPONENTS = [
    KbqTooltipComponent,
    KbqTooltipTrigger
];

@NgModule({
    imports: COMPONENTS,
    providers: [KBQ_TOOLTIP_OPEN_TIME_PROVIDER],
    exports: COMPONENTS
})
export class KbqToolTipModule {}
