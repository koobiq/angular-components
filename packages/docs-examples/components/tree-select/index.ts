import { NgModule } from '@angular/core';
import { TreeSelectChildSelectionOverviewExample } from './tree-select-child-selection-overview/tree-select-child-selection-overview-example';
import { TreeSelectCustomMatcherWithInputExample } from './tree-select-custom-matcher-with-input/tree-select-custom-matcher-with-input-example';
import { TreeSelectCustomMatcherExample } from './tree-select-custom-matcher/tree-select-custom-matcher-example';
import { TreeSelectCustomTriggerExample } from './tree-select-custom-trigger/tree-select-custom-trigger-example';
import { TreeSelectDeletedNodesExample } from './tree-select-deleted-nodes/tree-select-deleted-nodes-example';
import { TreeSelectFooterOverviewExample } from './tree-select-footer-overview/tree-select-footer-overview-example';
import { TreeSelectHeightExample } from './tree-select-height/tree-select-height-example';
import { TreeSelectLazyloadExample } from './tree-select-lazyload/tree-select-lazyload-example';
import { TreeSelectMultipleOverviewExample } from './tree-select-multiple-overview/tree-select-multiple-overview-example';
import { TreeSelectOverviewExample } from './tree-select-overview/tree-select-overview-example';
import { TreeSelectSearchOverviewExample } from './tree-select-search-overview/tree-select-search-overview-example';
import { TreeSelectSearchSmartExample } from './tree-select-search-smart/tree-select-search-smart-example';
import { TreeSelectSelectAllLabelExample } from './tree-select-select-all-label/tree-select-select-all-label-example';
import { TreeSelectSelectAllExample } from './tree-select-select-all/tree-select-select-all-example';
import { TreeSelectTwoLineOptionExample } from './tree-select-two-line-option/tree-select-two-line-option-example';
import { TreeSelectWithMultilineMatcherExample } from './tree-select-with-multiline-matcher-overview/tree-select-with-multiline-matcher-example';

export {
    TreeSelectChildSelectionOverviewExample,
    TreeSelectCustomMatcherExample,
    TreeSelectCustomMatcherWithInputExample,
    TreeSelectCustomTriggerExample,
    TreeSelectDeletedNodesExample,
    TreeSelectFooterOverviewExample,
    TreeSelectHeightExample,
    TreeSelectLazyloadExample,
    TreeSelectMultipleOverviewExample,
    TreeSelectOverviewExample,
    TreeSelectSearchOverviewExample,
    TreeSelectSearchSmartExample,
    TreeSelectSelectAllExample,
    TreeSelectSelectAllLabelExample,
    TreeSelectTwoLineOptionExample,
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
    TreeSelectHeightExample
];

@NgModule({
    imports: EXAMPLES,
    exports: EXAMPLES
})
export class TreeSelectExamplesModule {}
