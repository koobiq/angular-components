import { NgModule } from '@angular/core';
import { PopoverArrowAndOffsetExample } from './popover-arrow-and-offset/popover-arrow-and-offset-example';
import { PopoverArrowlessExample } from './popover-arrowless/popover-arrowless-example';
import { PopoverCloseExample } from './popover-close/popover-close-example';
import { PopoverContentExample } from './popover-content/popover-content-example';
import { PopoverHeaderExample } from './popover-header/popover-header-example';
import { PopoverHeightExample } from './popover-height/popover-height-example';
import { PopoverHideOnScrollExample } from './popover-hide-on-scroll/popover-hide-on-scroll-example';
import { PopoverHoverExample } from './popover-hover/popover-hover-example';
import { PopoverOverviewExample } from './popover-overview/popover-overview-example';
import { PopoverPaddingsExample } from './popover-paddings/popover-paddings-example';
import { PopoverPlacementCenterExample } from './popover-placement-center/popover-placement-center-example';
import { PopoverPlacementEdgesExample } from './popover-placement-edges/popover-placement-edges-example';
import { PopoverScrollStrategyExample } from './popover-scroll-strategy/popover-scroll-strategy-example';
import { PopoverScrollExample } from './popover-scroll/popover-scroll-example';
import { PopoverScrollingAndLayeringExample } from './popover-scrolling-and-layering/popover-scrolling-and-layering-example';
import { PopoverSmallExample } from './popover-small/popover-small-example';
import { PopoverWidthExample } from './popover-width/popover-width-example';

export {
    PopoverArrowAndOffsetExample,
    PopoverArrowlessExample,
    PopoverCloseExample,
    PopoverContentExample,
    PopoverHeaderExample,
    PopoverHeightExample,
    PopoverHideOnScrollExample,
    PopoverHoverExample,
    PopoverOverviewExample,
    PopoverPaddingsExample,
    PopoverPlacementCenterExample,
    PopoverPlacementEdgesExample,
    PopoverScrollExample,
    PopoverScrollingAndLayeringExample,
    PopoverScrollStrategyExample,
    PopoverSmallExample,
    PopoverWidthExample
};

const EXAMPLES = [
    PopoverArrowAndOffsetExample,
    PopoverArrowlessExample,
    PopoverOverviewExample,
    PopoverWidthExample,
    PopoverHeightExample,
    PopoverCloseExample,
    PopoverHeaderExample,
    PopoverContentExample,
    PopoverScrollExample,
    PopoverHideOnScrollExample,
    PopoverScrollStrategyExample,
    PopoverPlacementCenterExample,
    PopoverPlacementEdgesExample,
    PopoverHoverExample,
    PopoverSmallExample,
    PopoverPaddingsExample,
    PopoverScrollingAndLayeringExample
];

@NgModule({
    imports: EXAMPLES,
    exports: EXAMPLES
})
export class PopoverExamplesModule {}
