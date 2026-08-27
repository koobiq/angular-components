import { NgModule } from '@angular/core';
import { FilterBarCleanableExample } from './filter-bar-cleanable/filter-bar-cleanable-example';
import { FilterBarCompleteFunctionsExample } from './filter-bar-complete-functions/filter-bar-complete-functions-example';
import { FilterBarCustomPipeExample } from './filter-bar-custom-pipe/filter-bar-custom-pipe-example';
import { FilterBarDateLimitsExample } from './filter-bar-date-limits/filter-bar-date-limits-example';
import { FilterBarInactiveFilterExample } from './filter-bar-inactive-filter/filter-bar-inactive-filter-example';
import { FilterBarLocalizationExample } from './filter-bar-localization/filter-bar-localization-example';
import { FilterBarLockedOptionsExample } from './filter-bar-locked-options/filter-bar-locked-options-example';
import { FilterBarMasterCheckboxExample } from './filter-bar-master-checkbox/filter-bar-master-checkbox-example';
import { FilterBarOverviewExample } from './filter-bar-overview/filter-bar-overview-example';
import { FilterBarPanelMaxHeightExample } from './filter-bar-panel-max-height/filter-bar-panel-max-height-example';
import { FilterBarPipeTypesExample } from './filter-bar-pipe-types/filter-bar-pipe-types-example';
import { FilterBarReadonlyPipeExample } from './filter-bar-readonly-pipe/filter-bar-readonly-pipe-example';
import { FilterBarReadonlyPipesExample } from './filter-bar-readonly-pipes/filter-bar-readonly-pipes-example';
import { FilterBarRemovableExample } from './filter-bar-removable/filter-bar-removable-example';
import { FilterBarRequiredExample } from './filter-bar-required/filter-bar-required-example';
import { FilterBarSavedFiltersExample } from './filter-bar-saved-filters/filter-bar-saved-filters-example';
import { FilterBarSearchInPipesExample } from './filter-bar-search-in-pipes/filter-bar-search-in-pipes-example';
import { FilterBarSearchSimpleExample } from './filter-bar-search-simple/filter-bar-search-simple-example';
import { FilterBarSearchExample } from './filter-bar-search/filter-bar-search-example';
import { FilterBarUniqPipesExample } from './filter-bar-uniq-pipes/filter-bar-uniq-pipes-example';

export {
    FilterBarCleanableExample,
    FilterBarCompleteFunctionsExample,
    FilterBarCustomPipeExample,
    FilterBarDateLimitsExample,
    FilterBarInactiveFilterExample,
    FilterBarLocalizationExample,
    FilterBarLockedOptionsExample,
    FilterBarMasterCheckboxExample,
    FilterBarOverviewExample,
    FilterBarPanelMaxHeightExample,
    FilterBarPipeTypesExample,
    FilterBarReadonlyPipeExample,
    FilterBarReadonlyPipesExample,
    FilterBarRemovableExample,
    FilterBarRequiredExample,
    FilterBarSavedFiltersExample,
    FilterBarSearchExample,
    FilterBarSearchInPipesExample,
    FilterBarSearchSimpleExample,
    FilterBarUniqPipesExample
};

const EXAMPLES = [
    FilterBarOverviewExample,
    FilterBarPipeTypesExample,
    FilterBarDateLimitsExample,
    FilterBarRemovableExample,
    FilterBarCleanableExample,
    FilterBarRequiredExample,
    FilterBarSearchExample,
    FilterBarSearchSimpleExample,
    FilterBarCompleteFunctionsExample,
    FilterBarSavedFiltersExample,
    FilterBarCustomPipeExample,
    FilterBarUniqPipesExample,
    FilterBarReadonlyPipeExample,
    FilterBarReadonlyPipesExample,
    FilterBarMasterCheckboxExample,
    FilterBarLockedOptionsExample,
    FilterBarInactiveFilterExample,
    FilterBarSearchInPipesExample,
    FilterBarPanelMaxHeightExample,
    FilterBarLocalizationExample
];

@NgModule({
    imports: EXAMPLES,
    exports: EXAMPLES
})
export class FilterBarExamplesModule {}
