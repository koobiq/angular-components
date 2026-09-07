import { NgModule } from '@angular/core';
import { KbqTooltipComponent, KbqTooltipTrigger } from './tooltip.component';

const COMPONENTS = [
    KbqTooltipComponent,
    KbqTooltipTrigger
];

@NgModule({
    imports: COMPONENTS,
    exports: COMPONENTS
})
export class KbqToolTipModule {}
