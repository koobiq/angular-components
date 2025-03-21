import { NgModule } from '@angular/core';
import { FilterBarCleanableExample } from './filter-bar-cleanable/filter-bar-cleanable-example';
import { FilterBarCompleteFunctionsExample } from './filter-bar-complete-functions/filter-bar-complete-functions-example';
import { FilterBarOverviewExample } from './filter-bar-overview/filter-bar-overview-example';
import { FilterBarPipeTypesExample } from './filter-bar-pipe-types/filter-bar-pipe-types-example';
import { FilterBarRemovableExample } from './filter-bar-removable/filter-bar-removable-example';
import { FilterBarRequiredExample } from './filter-bar-required/filter-bar-required-example';
import { FilterBarSavedFiltersExample } from './filter-bar-saved-filters/filter-bar-saved-filters-example';
import { FilterBarSearchExample } from './filter-bar-search/filter-bar-search-example';

export {
    FilterBarCleanableExample,
    FilterBarCompleteFunctionsExample,
    FilterBarOverviewExample,
    FilterBarPipeTypesExample,
    FilterBarRemovableExample,
    FilterBarRequiredExample,
    FilterBarSavedFiltersExample,
    FilterBarSearchExample
};

const EXAMPLES = [
    FilterBarOverviewExample,
    FilterBarPipeTypesExample,
    FilterBarRemovableExample,
    FilterBarCleanableExample,
    FilterBarRequiredExample,
    FilterBarSearchExample,
    FilterBarCompleteFunctionsExample,
    FilterBarSavedFiltersExample
];

@NgModule({
    imports: EXAMPLES,
    exports: EXAMPLES
})
export class FilterBarExamplesModule {}
