import { NgModule } from '@angular/core';
import { TreeSelectChildSelectionOverviewExample } from './tree-select-child-selection-overview/tree-select-child-selection-overview-example';
import { TreeSelectFooterOverviewExample } from './tree-select-footer-overview/tree-select-footer-overview-example';
import { TreeSelectLazyloadExample } from './tree-select-lazyload/tree-select-lazyload-example';
import { TreeSelectMultipleOverviewExample } from './tree-select-multiple-overview/tree-select-multiple-overview-example';
import { TreeSelectOverviewExample } from './tree-select-overview/tree-select-overview-example';
import { TreeSelectSearchOverviewExample } from './tree-select-search-overview/tree-select-search-overview-example';

export {
    TreeSelectChildSelectionOverviewExample,
    TreeSelectFooterOverviewExample,
    TreeSelectLazyloadExample,
    TreeSelectMultipleOverviewExample,
    TreeSelectOverviewExample,
    TreeSelectSearchOverviewExample
};

const EXAMPLES = [
    TreeSelectOverviewExample,
    TreeSelectMultipleOverviewExample,
    TreeSelectChildSelectionOverviewExample,
    TreeSelectSearchOverviewExample,
    TreeSelectLazyloadExample,
    TreeSelectFooterOverviewExample
];

@NgModule({
    imports: EXAMPLES,
    exports: EXAMPLES
})
export class TreeSelectExamplesModule {}
