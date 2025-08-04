import { NgModule } from '@angular/core';
import { SelectCleanerExample } from './select-cleaner/select-cleaner-example';
import { SelectCustomMatcherExample } from './select-custom-matcher/select-custom-matcher-example';
import { SelectCustomTriggerExample } from './select-custom-trigger/select-custom-trigger-example';
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
import { SelectWithMultilineMatcherExample } from './select-with-multiline-matcher/select-with-multiline-matcher-example';
import { SelectWithPanelWidthAutoExample } from './select-with-panel-width-auto/select-with-panel-width-auto-example';
import { SelectWithPanelWidthDefaultExample } from './select-with-panel-width-default/select-with-panel-width-default-example';
import { SelectWithPanelWidthFixedExample } from './select-with-panel-width-fixed/select-with-panel-width-fixed-example';

export {
    SelectCleanerExample,
    SelectCustomMatcherExample,
    SelectCustomTriggerExample,
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
    SelectWithMultilineMatcherExample,
    SelectWithPanelWidthAutoExample,
    SelectWithPanelWidthDefaultExample,
    SelectWithPanelWidthFixedExample
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
    SelectWithPanelWidthDefaultExample,
    SelectCustomMatcherExample,
    SelectCustomTriggerExample,
    SelectWithMultilineMatcherExample,
    SelectWithPanelWidthAutoExample,
    SelectWithPanelWidthFixedExample
];

@NgModule({
    imports: EXAMPLES,
    exports: EXAMPLES
})
export class SelectExamplesModule {}
