import { NgModule } from '@angular/core';
import { SearchExpandableInHeaderExample } from './search-expandable-in-header/search-expandable-in-header-example';
import { SearchExpandableOverviewExample } from './search-expandable-overview/search-expandable-overview-example';

export { SearchExpandableInHeaderExample, SearchExpandableOverviewExample };

const EXAMPLES = [
    SearchExpandableOverviewExample,
    SearchExpandableInHeaderExample
];

@NgModule({
    imports: EXAMPLES,
    exports: EXAMPLES
})
export class SearchExpandableExamplesModule {}
