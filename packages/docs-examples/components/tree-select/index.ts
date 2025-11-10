import { NgModule } from '@angular/core';
import { TreeSelectChildSelectionOverviewExample } from './tree-select-child-selection-overview/tree-select-child-selection-overview-example';
import { TreeSelectCustomMatcherWithInputExample } from './tree-select-custom-matcher-with-input/tree-select-custom-matcher-with-input-example';
import { TreeSelectCustomMatcherExample } from './tree-select-custom-matcher/tree-select-custom-matcher-example';
import { TreeSelectCustomTriggerExample } from './tree-select-custom-trigger/tree-select-custom-trigger-example';
import { TreeSelectFooterOverviewExample } from './tree-select-footer-overview/tree-select-footer-overview-example';
import { TreeSelectLazyloadExample } from './tree-select-lazyload/tree-select-lazyload-example';
import { TreeSelectMultipleOverviewExample } from './tree-select-multiple-overview/tree-select-multiple-overview-example';
import { TreeSelectOverviewExample } from './tree-select-overview/tree-select-overview-example';
import { TreeSelectSearchOverviewExample } from './tree-select-search-overview/tree-select-search-overview-example';
import { TreeSelectWithMultilineMatcherExample } from './tree-select-with-multiline-matcher-overview/tree-select-with-multiline-matcher-example';

export {
    TreeSelectChildSelectionOverviewExample,
    TreeSelectCustomMatcherExample,
    TreeSelectCustomMatcherWithInputExample,
    TreeSelectCustomTriggerExample,
    TreeSelectFooterOverviewExample,
    TreeSelectLazyloadExample,
    TreeSelectMultipleOverviewExample,
    TreeSelectOverviewExample,
    TreeSelectSearchOverviewExample,
    TreeSelectWithMultilineMatcherExample
};

const EXAMPLES = [
    TreeSelectOverviewExample,
    TreeSelectMultipleOverviewExample,
    TreeSelectChildSelectionOverviewExample,
    TreeSelectSearchOverviewExample,
    TreeSelectLazyloadExample,
    TreeSelectFooterOverviewExample,
    TreeSelectCustomTriggerExample,
    TreeSelectCustomMatcherExample,
    TreeSelectWithMultilineMatcherExample,
    TreeSelectCustomMatcherWithInputExample
];

@NgModule({
    imports: EXAMPLES,
    exports: EXAMPLES
})
export class TreeSelectExamplesModule {}
