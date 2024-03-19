import { A11yModule } from '@angular/cdk/a11y';
import { CdkScrollableModule } from '@angular/cdk/scrolling';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { KbqButtonModule } from '@koobiq/components/button';
import { KbqToolTipModule } from '@koobiq/components/tooltip';

import { TooltipExtendedExample } from './tooltip-extended/tooltip-extended-example';
import { TooltipLongExample } from './tooltip-long/tooltip-long-example';
import { TooltipMultipleLinesExample } from './tooltip-multiple-lines/tooltip-multiple-lines-example';
import { TooltipOverviewExample } from './tooltip-overview/tooltip-overview-example';
import { TooltipPlacementCenterExample } from './tooltip-placement-center/tooltip-placement-center-example';
import { TooltipPlacementEdgesExample } from './tooltip-placement-edges/tooltip-placement-edges-example';


export {
    TooltipOverviewExample,
    TooltipExtendedExample,
    TooltipMultipleLinesExample,
    TooltipLongExample,
    TooltipPlacementCenterExample,
    TooltipPlacementEdgesExample
};

const EXAMPLES = [
    TooltipOverviewExample,
    TooltipExtendedExample,
    TooltipMultipleLinesExample,
    TooltipLongExample,
    TooltipPlacementCenterExample,
    TooltipPlacementEdgesExample
];

@NgModule({
    imports: [
        CommonModule,
        A11yModule,
        KbqButtonModule,
        KbqToolTipModule,
        CdkScrollableModule
    ],
    declarations: EXAMPLES,
    exports: EXAMPLES
})
export class TooltipExamplesModule {}
