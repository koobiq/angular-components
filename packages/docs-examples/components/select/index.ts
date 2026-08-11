import { NgModule } from '@angular/core';
import { SelectAddNewOptionExample } from './select-add-new-option/select-add-new-option-example';
import { SelectAutoHideScrollStrategyExample } from './select-auto-hide-scroll-strategy/select-auto-hide-scroll-strategy-example';
import { SelectCleanerExample } from './select-cleaner/select-cleaner-example';
import { SelectCustomMatcherExample } from './select-custom-matcher/select-custom-matcher-example';
import { SelectCustomTagContentExample } from './select-custom-tag-content/select-custom-tag-content-example';
import { SelectCustomTriggerExample } from './select-custom-trigger/select-custom-trigger-example';
import { SelectDisabledExample } from './select-disabled/select-disabled-example';
import { SelectFooterExample } from './select-footer/select-footer-example';
import { SelectGroupsExample } from './select-groups/select-groups-example';
import { SelectHeightExample } from './select-height/select-height-example';
import { SelectIconExample } from './select-icon/select-icon-example';
import { SelectLoadingErrorCustomExample } from './select-loading-error-custom/select-loading-error-custom-example';
import { SelectLoadingErrorExample } from './select-loading-error/select-loading-error-example';
import { SelectLoadingExample } from './select-loading/select-loading-example';
import { SelectMultipleExample } from './select-multiple/select-multiple-example';
import { SelectNoVariantsExample } from './select-no-variants/select-no-variants-example';
import { SelectOverviewExample } from './select-overview/select-overview-example';
import { SelectPagingErrorExample } from './select-paging-error/select-paging-error-example';
import { SelectPagingExample } from './select-paging/select-paging-example';
import { SelectPreselectedValuesExample } from './select-preselected-values/select-preselected-values-example';
import { SelectPrioritizedSelectedExample } from './select-prioritized-selected/select-prioritized-selected-example';
import { SelectScrollingAndLayeringExample } from './select-scrolling-and-layering/select-scrolling-and-layering-example';
import { SelectSearchExample } from './select-search/select-search-example';
import { SelectSelectAllDisabledExample } from './select-select-all-disabled/select-select-all-disabled-example';
import { SelectSelectAllSearchExample } from './select-select-all-search/select-select-all-search-example';
import { SelectSelectAllExample } from './select-select-all/select-select-all-example';
import { SelectTwoLineOptionExample } from './select-two-line-option/select-two-line-option-example';
import { SelectValidationExample } from './select-validation/select-validation-example';
import { SelectVirtualScrollExample } from './select-virtual-scroll/select-virtual-scroll-example';
import { SelectWithMultilineMatcherExample } from './select-with-multiline-matcher/select-with-multiline-matcher-example';
import { SelectWithPanelMinWidthExample } from './select-with-panel-min-width/select-with-panel-min-width-example';
import { SelectWithPanelWidthAutoExample } from './select-with-panel-width-auto/select-with-panel-width-auto-example';
import { SelectWithPanelWidthDefaultExample } from './select-with-panel-width-default/select-with-panel-width-default-example';
import { SelectWithPanelWidthFixedExample } from './select-with-panel-width-fixed/select-with-panel-width-fixed-example';

export {
    SelectAddNewOptionExample,
    SelectAutoHideScrollStrategyExample,
    SelectCleanerExample,
    SelectCustomMatcherExample,
    SelectCustomTagContentExample,
    SelectCustomTriggerExample,
    SelectDisabledExample,
    SelectFooterExample,
    SelectGroupsExample,
    SelectHeightExample,
    SelectIconExample,
    SelectLoadingErrorCustomExample,
    SelectLoadingErrorExample,
    SelectLoadingExample,
    SelectMultipleExample,
    SelectNoVariantsExample,
    SelectOverviewExample,
    SelectPagingErrorExample,
    SelectPagingExample,
    SelectPreselectedValuesExample,
    SelectPrioritizedSelectedExample,
    SelectScrollingAndLayeringExample,
    SelectSearchExample,
    SelectSelectAllDisabledExample,
    SelectSelectAllExample,
    SelectSelectAllSearchExample,
    SelectTwoLineOptionExample,
    SelectValidationExample,
    SelectVirtualScrollExample,
    SelectWithMultilineMatcherExample,
    SelectWithPanelMinWidthExample,
    SelectWithPanelWidthAutoExample,
    SelectWithPanelWidthDefaultExample,
    SelectWithPanelWidthFixedExample
};

const EXAMPLES = [
    SelectAutoHideScrollStrategyExample,
    SelectCleanerExample,
    SelectDisabledExample,
    SelectOverviewExample,
    SelectMultipleExample,
    SelectSearchExample,
    SelectSelectAllExample,
    SelectSelectAllSearchExample,
    SelectSelectAllDisabledExample,
    SelectPreselectedValuesExample,
    SelectGroupsExample,
    SelectHeightExample,
    SelectIconExample,
    SelectFooterExample,
    SelectValidationExample,
    SelectVirtualScrollExample,
    SelectWithPanelWidthDefaultExample,
    SelectCustomMatcherExample,
    SelectCustomTriggerExample,
    SelectCustomTagContentExample,
    SelectWithMultilineMatcherExample,
    SelectWithPanelWidthAutoExample,
    SelectWithPanelWidthFixedExample,
    SelectPrioritizedSelectedExample,
    SelectWithPanelMinWidthExample,
    SelectScrollingAndLayeringExample,
    SelectLoadingExample,
    SelectLoadingErrorExample,
    SelectNoVariantsExample,
    SelectAddNewOptionExample,
    SelectLoadingErrorCustomExample,
    SelectPagingExample,
    SelectPagingErrorExample,
    SelectTwoLineOptionExample
];

@NgModule({
    imports: EXAMPLES,
    exports: EXAMPLES
})
export class SelectExamplesModule {}
