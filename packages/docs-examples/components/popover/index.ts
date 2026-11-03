import { NgModule } from '@angular/core';
import { PopoverArrowAndOffsetExample } from './popover-arrow-and-offset/popover-arrow-and-offset-example';
import { PopoverArrowlessExample } from './popover-arrowless/popover-arrowless-example';
import { PopoverCloseExample } from './popover-close/popover-close-example';
import { PopoverContentExample } from './popover-content/popover-content-example';
import { PopoverHeaderExample } from './popover-header/popover-header-example';
import { PopoverHeightExample } from './popover-height/popover-height-example';
import { PopoverHoverExample } from './popover-hover/popover-hover-example';
import { PopoverOverviewExample } from './popover-overview/popover-overview-example';
import { PopoverPaddingsExample } from './popover-paddings/popover-paddings-example';
import { PopoverPlacementCenterExample } from './popover-placement-center/popover-placement-center-example';
import { PopoverPlacementEdgesExample } from './popover-placement-edges/popover-placement-edges-example';
import { PopoverRelativeToPointerExample } from './popover-relative-to-pointer/popover-relative-to-pointer-example';
import { PopoverScrollExample } from './popover-scroll/popover-scroll-example';
import { PopoverScrollingAndLayeringPageExample } from './popover-scrolling-and-layering-page/popover-scrolling-and-layering-page-example';
import { PopoverScrollingAndLayeringExample } from './popover-scrolling-and-layering/popover-scrolling-and-layering-example';
import { PopoverSmallExample } from './popover-small/popover-small-example';
import { PopoverTextSelectionExample } from './popover-text-selection/popover-text-selection-example';
import { PopoverWidthExample } from './popover-width/popover-width-example';

export {
    PopoverArrowAndOffsetExample,
    PopoverArrowlessExample,
    PopoverCloseExample,
    PopoverContentExample,
    PopoverHeaderExample,
    PopoverHeightExample,
    PopoverHoverExample,
    PopoverOverviewExample,
    PopoverPaddingsExample,
    PopoverPlacementCenterExample,
    PopoverPlacementEdgesExample,
    PopoverRelativeToPointerExample,
    PopoverScrollExample,
    PopoverScrollingAndLayeringExample,
    PopoverScrollingAndLayeringPageExample,
    PopoverSmallExample,
    PopoverTextSelectionExample,
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
    PopoverPlacementCenterExample,
    PopoverPlacementEdgesExample,
    PopoverRelativeToPointerExample,
    PopoverHoverExample,
    PopoverSmallExample,
    PopoverPaddingsExample,
    PopoverScrollingAndLayeringExample,
    PopoverScrollingAndLayeringPageExample,
    PopoverTextSelectionExample
];

@NgModule({
    imports: EXAMPLES,
    exports: EXAMPLES
})
export class PopoverExamplesModule {}
