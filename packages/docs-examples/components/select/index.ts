import { NgModule } from '@angular/core';
import { SelectCleanerExample } from './select-cleaner/select-cleaner-example';
import { SelectDisabledExample } from './select-disabled/select-disabled-example';
import { SelectFooterExample } from './select-footer/select-footer-example';
import { SelectGroupsExample } from './select-groups/select-groups-example';
import { SelectHeightExample } from './select-height/select-height-example';
import { SelectIconExample } from './select-icon/select-icon-example';
import { SelectMultipleExample } from './select-multiple/select-multiple-example';
import { SelectOverviewExample } from './select-overview/select-overview-example';
import { SelectPrioritizedSelectedExample } from './select-prioritized-selected/select-prioritized-selected-example';
import { SelectSearchExample } from './select-search/select-search-example';
import { SelectValidationExample } from './select-validation/select-validation-example';
import { SelectVirtualScrollExample } from './select-virtual-scroll/select-virtual-scroll-example';
import { SelectWidthFixedExample } from './select-width-fixed/select-width-fixed-example';
import { SelectWidthMaxExample } from './select-width-max/select-width-max-example';
import { SelectWidthMinExample } from './select-width-min/select-width-min-example';
import { SelectWidthExample } from './select-width/select-width-example';

export {
    SelectCleanerExample,
    SelectDisabledExample,
    SelectFooterExample,
    SelectGroupsExample,
    SelectHeightExample,
    SelectIconExample,
    SelectMultipleExample,
    SelectOverviewExample,
    SelectPrioritizedSelectedExample,
    SelectSearchExample,
    SelectValidationExample,
    SelectVirtualScrollExample,
    SelectWidthExample,
    SelectWidthFixedExample,
    SelectWidthMaxExample,
    SelectWidthMinExample
};

const EXAMPLES = [
    SelectCleanerExample,
    SelectDisabledExample,
    SelectOverviewExample,
    SelectMultipleExample,
    SelectSearchExample,
    SelectPrioritizedSelectedExample,
    SelectGroupsExample,
    SelectHeightExample,
    SelectIconExample,
    SelectFooterExample,
    SelectValidationExample,
    SelectVirtualScrollExample,
    SelectWidthExample,
    SelectWidthFixedExample,
    SelectWidthMaxExample,
    SelectWidthMinExample
];

@NgModule({
    imports: EXAMPLES,
    exports: EXAMPLES
})
export class SelectExamplesModule {}
