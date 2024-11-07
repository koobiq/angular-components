import { NgModule } from '@angular/core';
import { SelectFooterExample } from './select-footer/select-footer-example';
import { SelectGroupsExample } from './select-groups/select-groups-example';
import { SelectMultipleOverviewExample } from './select-multiple-overview/select-multiple-overview-example';
import { SelectOverviewExample } from './select-overview/select-overview-example';
import { SelectPrioritizedSelectedExample } from './select-prioritized-selected/select-prioritized-selected-example';
import { SelectSearchOverviewExample } from './select-search-overview/select-search-overview-example';
import { SelectVirtualScrollExample } from './select-virtual-scroll/select-virtual-scroll-example';

export {
    SelectFooterExample,
    SelectGroupsExample,
    SelectMultipleOverviewExample,
    SelectOverviewExample,
    SelectPrioritizedSelectedExample,
    SelectSearchOverviewExample,
    SelectVirtualScrollExample
};

const EXAMPLES = [
    SelectOverviewExample,
    SelectMultipleOverviewExample,
    SelectSearchOverviewExample,
    SelectPrioritizedSelectedExample,
    SelectGroupsExample,
    SelectFooterExample,
    SelectVirtualScrollExample
];

@NgModule({
    imports: EXAMPLES,
    exports: EXAMPLES
})
export class SelectExamplesModule {}
