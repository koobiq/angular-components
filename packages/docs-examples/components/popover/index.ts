import { NgModule } from '@angular/core';
import { PopoverArrowAndOffsetExample } from './popover-arrow-and-offset/popover-arrow-and-offset-example';
import { PopoverArrowlessExample } from './popover-arrowless/popover-arrowless-example';
import { PopoverCloseExample } from './popover-close/popover-close-example';
import { PopoverCommonExample } from './popover-common/popover-common-example';
import { PopoverContentExample } from './popover-content/popover-content-example';
import { PopoverHeaderExample } from './popover-header/popover-header-example';
import { PopoverHeightExample } from './popover-height/popover-height-example';
import { PopoverHoverExample } from './popover-hover/popover-hover-example';
import { PopoverPaddingsExample } from './popover-paddings/popover-paddings-example';
import { PopoverPlacementCenterExample } from './popover-placement-center/popover-placement-center-example';
import { PopoverPlacementEdgesExample } from './popover-placement-edges/popover-placement-edges-example';
import { PopoverScrollExample } from './popover-scroll/popover-scroll-example';
import { PopoverSmallExample } from './popover-small/popover-small-example';
import { PopoverWidthExample } from './popover-width/popover-width-example';

export {
    PopoverArrowAndOffsetExample,
    PopoverArrowlessExample,
    PopoverCloseExample,
    PopoverCommonExample,
    PopoverContentExample,
    PopoverHeaderExample,
    PopoverHeightExample,
    PopoverHoverExample,
    PopoverPaddingsExample,
    PopoverPlacementCenterExample,
    PopoverPlacementEdgesExample,
    PopoverScrollExample,
    PopoverSmallExample,
    PopoverWidthExample
};

const EXAMPLES = [
    PopoverArrowAndOffsetExample,
    PopoverArrowlessExample,
    PopoverCommonExample,
    PopoverWidthExample,
    PopoverHeightExample,
    PopoverCloseExample,
    PopoverHeaderExample,
    PopoverContentExample,
    PopoverScrollExample,
    PopoverPlacementCenterExample,
    PopoverPlacementEdgesExample,
    PopoverHoverExample,
    PopoverSmallExample,
    PopoverPaddingsExample
];

@NgModule({
    imports: EXAMPLES,
    exports: EXAMPLES
})
export class PopoverExamplesModule {}
