import { NgModule } from '@angular/core';
import { LayoutFlexAlignmentExample } from './layout-flex-alignment/layout-flex-alignment-example';
import { LayoutFlexBehaviourModifiersExample } from './layout-flex-behaviour-modifiers/layout-flex-behaviour-modifiers-example';
import { LayoutFlexOffsetsExample } from './layout-flex-offsets/layout-flex-offsets-example';
import { LayoutFlexOrderExample } from './layout-flex-order/layout-flex-order-example';
import { LayoutFlexOverviewExample } from './layout-flex-overview/layout-flex-overview-example';

export {
    LayoutFlexAlignmentExample,
    LayoutFlexBehaviourModifiersExample,
    LayoutFlexOffsetsExample,
    LayoutFlexOrderExample,
    LayoutFlexOverviewExample
};

const EXAMPLES = [
    LayoutFlexOverviewExample,
    LayoutFlexAlignmentExample,
    LayoutFlexBehaviourModifiersExample,
    LayoutFlexOffsetsExample,
    LayoutFlexOrderExample
];

@NgModule({
    imports: EXAMPLES,
    exports: EXAMPLES
})
export class FlexLayoutExamplesModule {}
