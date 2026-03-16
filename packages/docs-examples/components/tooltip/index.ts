import { NgModule } from '@angular/core';
import { TooltipDisabledExample } from './tooltip-disabled/tooltip-disabled-example';
import { TooltipExtendedExample } from './tooltip-extended/tooltip-extended-example';
import { TooltipOffsetExample } from './tooltip-offset/tooltip-offset-example';
import { TooltipOverviewExample } from './tooltip-overview/tooltip-overview-example';
import { TooltipPlacementsExample } from './tooltip-placements/tooltip-placements-example';

import { TooltipArrowExample } from './tooltip-arrow/tooltip-arrow-example';
import { TooltipDynamicExample } from './tooltip-dynamic/tooltip-dynamic-example';
import { TooltipHideWithTimeoutExample } from './tooltip-hide-with-timeout/tooltip-hide-with-timeout-example';
import { TooltipInteractiveExample } from './tooltip-interactive/tooltip-interactive-example';
import { TooltipRelativeToPointerExample } from './tooltip-relative-to-pointer/tooltip-relative-to-pointer-example';
import { TooltipStyleExample } from './tooltip-style/tooltip-style-example';
import { TooltipWideWidthExample } from './tooltip-wide-width/tooltip-wide-width-example';
import { TooltipWidthExample } from './tooltip-width/tooltip-width-example';

export {
    TooltipArrowExample,
    TooltipDisabledExample,
    TooltipDynamicExample,
    TooltipExtendedExample,
    TooltipHideWithTimeoutExample,
    TooltipInteractiveExample,
    TooltipOffsetExample,
    TooltipOverviewExample,
    TooltipPlacementsExample,
    TooltipRelativeToPointerExample,
    TooltipStyleExample,
    TooltipWideWidthExample,
    TooltipWidthExample
};

const EXAMPLES = [
    TooltipOffsetExample,
    TooltipOverviewExample,
    TooltipExtendedExample,
    TooltipDisabledExample,
    TooltipPlacementsExample,
    TooltipStyleExample,
    TooltipRelativeToPointerExample,
    TooltipHideWithTimeoutExample,
    TooltipDynamicExample,
    TooltipWidthExample,
    TooltipWideWidthExample,
    TooltipArrowExample,
    TooltipInteractiveExample
];

@NgModule({
    imports: EXAMPLES,
    exports: EXAMPLES
})
export class TooltipExamplesModule {}
