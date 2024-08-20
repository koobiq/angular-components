import { A11yModule } from '@angular/cdk/a11y';
import { CdkScrollableModule } from '@angular/cdk/scrolling';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { KbqButtonModule } from '@koobiq/components/button';
import { KbqButtonToggleModule } from '@koobiq/components/button-toggle';
import { KbqDlModule } from '@koobiq/components/dl';
import { KbqTabsModule } from '@koobiq/components/tabs';
import { KbqToggleModule } from '@koobiq/components/toggle';
import { KbqToolTipModule } from '@koobiq/components/tooltip';
import { TooltipArrowAndOffsetExample } from './tooltip-arrow-and-offset/tooltip-arrow-and-offset-example';
import { TooltipExtendedExample } from './tooltip-extended/tooltip-extended-example';
import { TooltipLongExample } from './tooltip-long/tooltip-long-example';
import { TooltipMultipleLinesExample } from './tooltip-multiple-lines/tooltip-multiple-lines-example';
import { TooltipOverviewExample } from './tooltip-overview/tooltip-overview-example';
import { TooltipPlacementCenterExample } from './tooltip-placement-center/tooltip-placement-center-example';
import { TooltipPlacementEdgesExample } from './tooltip-placement-edges/tooltip-placement-edges-example';

import { TooltipStyleExample } from './tooltip-style/tooltip-style-example';

export {
    TooltipArrowAndOffsetExample,
    TooltipExtendedExample,
    TooltipLongExample,
    TooltipMultipleLinesExample,
    TooltipOverviewExample,
    TooltipPlacementCenterExample,
    TooltipPlacementEdgesExample,
    TooltipStyleExample
};

const EXAMPLES = [
    TooltipArrowAndOffsetExample,
    TooltipOverviewExample,
    TooltipExtendedExample,
    TooltipMultipleLinesExample,
    TooltipLongExample,
    TooltipPlacementCenterExample,
    TooltipPlacementEdgesExample,
    TooltipStyleExample
];

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        A11yModule,
        KbqButtonModule,
        KbqToolTipModule,
        KbqTabsModule,
        KbqToggleModule,
        CdkScrollableModule,
        KbqDlModule,
        KbqButtonToggleModule
    ],
    declarations: EXAMPLES,
    exports: EXAMPLES
})
export class TooltipExamplesModule {}
