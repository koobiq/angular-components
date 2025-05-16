import { NgModule } from '@angular/core';
import { FilterBarCleanableExample } from './filter-bar-cleanable/filter-bar-cleanable-example';
import { FilterBarCompleteFunctionsExample } from './filter-bar-complete-functions/filter-bar-complete-functions-example';
import { FilterBarCustomPipeExample } from './filter-bar-custom-pipe/filter-bar-custom-pipe-example';
import { FilterBarInactiveFilterExample } from './filter-bar-inactive-filter/filter-bar-inactive-filter-example';
import { FilterBarMasterCheckboxExample } from './filter-bar-master-checkbox/filter-bar-master-checkbox-example';
import { FilterBarOverviewExample } from './filter-bar-overview/filter-bar-overview-example';
import { FilterBarPipeTypesExample } from './filter-bar-pipe-types/filter-bar-pipe-types-example';
import { FilterBarReadonlyPipeExample } from './filter-bar-readonly-pipe/filter-bar-readonly-pipe-example';
import { FilterBarReadonlyPipesExample } from './filter-bar-readonly-pipes/filter-bar-readonly-pipes-example';
import { FilterBarRemovableExample } from './filter-bar-removable/filter-bar-removable-example';
import { FilterBarRequiredExample } from './filter-bar-required/filter-bar-required-example';
import { FilterBarSavedFiltersExample } from './filter-bar-saved-filters/filter-bar-saved-filters-example';
import { FilterBarSearchInPipesExample } from './filter-bar-search-in-pipes/filter-bar-search-in-pipes-example';
import { FilterBarSearchExample } from './filter-bar-search/filter-bar-search-example';
import { FilterBarUniqPipesExample } from './filter-bar-uniq-pipes/filter-bar-uniq-pipes-example';

export {
    FilterBarCleanableExample,
    FilterBarCompleteFunctionsExample,
    FilterBarCustomPipeExample,
    FilterBarInactiveFilterExample,
    FilterBarMasterCheckboxExample,
    FilterBarOverviewExample,
    FilterBarPipeTypesExample,
    FilterBarReadonlyPipeExample,
    FilterBarReadonlyPipesExample,
    FilterBarRemovableExample,
    FilterBarRequiredExample,
    FilterBarSavedFiltersExample,
    FilterBarSearchExample,
    FilterBarSearchInPipesExample,
    FilterBarUniqPipesExample
};

const EXAMPLES = [
    FilterBarOverviewExample,
    FilterBarPipeTypesExample,
    FilterBarRemovableExample,
    FilterBarCleanableExample,
    FilterBarRequiredExample,
    FilterBarSearchExample,
    FilterBarCompleteFunctionsExample,
    FilterBarSavedFiltersExample,
    FilterBarCustomPipeExample,
    FilterBarUniqPipesExample,
    FilterBarReadonlyPipeExample,
    FilterBarReadonlyPipesExample,
    FilterBarMasterCheckboxExample,
    FilterBarInactiveFilterExample,
    FilterBarSearchInPipesExample
];

@NgModule({
    imports: EXAMPLES,
    exports: EXAMPLES
})
export class FilterBarExamplesModule {}
