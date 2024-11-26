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
import { SelectWithPanelWidthAttributeExample } from './select-with-panel-width-attribute/select-with-panel-width-attribute-example';

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
    SelectWithPanelWidthAttributeExample
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
    SelectWithPanelWidthAttributeExample
];

@NgModule({
    imports: EXAMPLES,
    exports: EXAMPLES
})
export class SelectExamplesModule {}
