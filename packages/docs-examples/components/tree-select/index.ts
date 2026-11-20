import { NgModule } from '@angular/core';
import { TreeSelectChildSelectionOverviewExample } from './tree-select-child-selection-overview/tree-select-child-selection-overview-example';
import { TreeSelectCleanerWithDisabledExample } from './tree-select-cleaner-with-disabled/tree-select-cleaner-with-disabled-example';
import { TreeSelectCustomMatcherExample } from './tree-select-custom-matcher/tree-select-custom-matcher-example';
import { TreeSelectCustomMatcherWithInputExample } from './tree-select-custom-matcher-with-input/tree-select-custom-matcher-with-input-example';
import { TreeSelectCustomTagContentExample } from './tree-select-custom-tag-content/tree-select-custom-tag-content-example';
import { TreeSelectCustomTriggerExample } from './tree-select-custom-trigger/tree-select-custom-trigger-example';
import { TreeSelectDeletedNodesExample } from './tree-select-deleted-nodes/tree-select-deleted-nodes-example';
import { TreeSelectDisabledExample } from './tree-select-disabled/tree-select-disabled-example';
import { TreeSelectFooterOverviewExample } from './tree-select-footer-overview/tree-select-footer-overview-example';
import { TreeSelectHeightExample } from './tree-select-height/tree-select-height-example';
import { TreeSelectIconExample } from './tree-select-icon/tree-select-icon-example';
import { TreeSelectLazyloadExample } from './tree-select-lazyload/tree-select-lazyload-example';
import { TreeSelectLocaleConfigurationExample } from './tree-select-locale-configuration/tree-select-locale-configuration-example';
import { TreeSelectMultipleOverviewExample } from './tree-select-multiple-overview/tree-select-multiple-overview-example';
import { TreeSelectNoVariantsExample } from './tree-select-no-variants/tree-select-no-variants-example';
import { TreeSelectOverviewExample } from './tree-select-overview/tree-select-overview-example';
import { TreeSelectScrollStrategyExample } from './tree-select-scroll-strategy/tree-select-scroll-strategy-example';
import { TreeSelectScrollingAndLayeringExample } from './tree-select-scrolling-and-layering/tree-select-scrolling-and-layering-example';
import { TreeSelectScrollingAndLayeringPageExample } from './tree-select-scrolling-and-layering-page/tree-select-scrolling-and-layering-page-example';
import { TreeSelectSearchOverviewExample } from './tree-select-search-overview/tree-select-search-overview-example';
import { TreeSelectSearchSmartExample } from './tree-select-search-smart/tree-select-search-smart-example';
import { TreeSelectSelectAllExample } from './tree-select-select-all/tree-select-select-all-example';
import { TreeSelectSelectAllLabelExample } from './tree-select-select-all-label/tree-select-select-all-label-example';
import { TreeSelectTwoLineOptionExample } from './tree-select-two-line-option/tree-select-two-line-option-example';
import { TreeSelectValidationExample } from './tree-select-validation/tree-select-validation-example';
import { TreeSelectWithMultilineMatcherExample } from './tree-select-with-multiline-matcher-overview/tree-select-with-multiline-matcher-example';

export {
    TreeSelectChildSelectionOverviewExample,
    TreeSelectCleanerWithDisabledExample,
    TreeSelectCustomMatcherExample,
    TreeSelectCustomMatcherWithInputExample,
    TreeSelectCustomTagContentExample,
    TreeSelectCustomTriggerExample,
    TreeSelectDeletedNodesExample,
    TreeSelectDisabledExample,
    TreeSelectFooterOverviewExample,
    TreeSelectHeightExample,
    TreeSelectIconExample,
    TreeSelectLazyloadExample,
    TreeSelectLocaleConfigurationExample,
    TreeSelectMultipleOverviewExample,
    TreeSelectNoVariantsExample,
    TreeSelectOverviewExample,
    TreeSelectScrollingAndLayeringExample,
    TreeSelectScrollingAndLayeringPageExample,
    TreeSelectScrollStrategyExample,
    TreeSelectSearchOverviewExample,
    TreeSelectSearchSmartExample,
    TreeSelectSelectAllExample,
    TreeSelectSelectAllLabelExample,
    TreeSelectTwoLineOptionExample,
    TreeSelectValidationExample,
    TreeSelectWithMultilineMatcherExample
};

const EXAMPLES = [
    TreeSelectOverviewExample,
    TreeSelectMultipleOverviewExample,
    TreeSelectChildSelectionOverviewExample,
    TreeSelectSearchOverviewExample,
    TreeSelectSearchSmartExample,
    TreeSelectSelectAllExample,
    TreeSelectSelectAllLabelExample,
    TreeSelectLazyloadExample,
    TreeSelectFooterOverviewExample,
    TreeSelectCustomTriggerExample,
    TreeSelectCustomMatcherExample,
    TreeSelectWithMultilineMatcherExample,
    TreeSelectCustomMatcherWithInputExample,
    TreeSelectTwoLineOptionExample,
    TreeSelectDeletedNodesExample,
    TreeSelectHeightExample,
    TreeSelectCleanerWithDisabledExample,
    TreeSelectValidationExample,
    TreeSelectDisabledExample,
    TreeSelectIconExample,
    TreeSelectLocaleConfigurationExample,
    TreeSelectScrollingAndLayeringExample,
    TreeSelectScrollingAndLayeringPageExample,
    TreeSelectCustomTagContentExample,
    TreeSelectNoVariantsExample,
    TreeSelectScrollStrategyExample
];

@NgModule({
    imports: EXAMPLES,
    exports: EXAMPLES
})
export class TreeSelectExamplesModule {}
