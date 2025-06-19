import { NgModule } from '@angular/core';
import { TooltipArrowAndOffsetExample } from './tooltip-arrow-and-offset/tooltip-arrow-and-offset-example';
import { TooltipExtendedExample } from './tooltip-extended/tooltip-extended-example';
import { TooltipLongExample } from './tooltip-long/tooltip-long-example';
import { TooltipMultipleLinesExample } from './tooltip-multiple-lines/tooltip-multiple-lines-example';
import { TooltipOverviewExample } from './tooltip-overview/tooltip-overview-example';
import { TooltipPlacementCenterExample } from './tooltip-placement-center/tooltip-placement-center-example';
import { TooltipPlacementEdgesExample } from './tooltip-placement-edges/tooltip-placement-edges-example';

import { TooltipHideWithTimeoutExample } from './tooltip-hide-with-timeout/tooltip-hide-with-timeout-example';
import { TooltipRelativeToPointerExample } from './tooltip-relative-to-pointer/tooltip-relative-to-pointer-example';
import { TooltipStyleExample } from './tooltip-style/tooltip-style-example';

export {
    TooltipArrowAndOffsetExample,
    TooltipExtendedExample,
    TooltipHideWithTimeoutExample,
    TooltipLongExample,
    TooltipMultipleLinesExample,
    TooltipOverviewExample,
    TooltipPlacementCenterExample,
    TooltipPlacementEdgesExample,
    TooltipRelativeToPointerExample,
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
    TooltipStyleExample,
    TooltipRelativeToPointerExample,
    TooltipHideWithTimeoutExample
];

@NgModule({
    imports: EXAMPLES,
    exports: EXAMPLES
})
export class TooltipExamplesModule {}
