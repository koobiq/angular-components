import { NgModule } from '@angular/core';
import { FilterBarCleanableExample } from './filter-bar-cleanable/filter-bar-cleanable-example';
import { FilterBarCompleteFunctionsExample } from './filter-bar-complete-functions/filter-bar-complete-functions-example';
import { FilterBarEmptyRemovableExample } from './filter-bar-empty-removable/filter-bar-empty-removable-example';
import { FilterBarOperatingModesExample } from './filter-bar-operating-modes/filter-bar-operating-modes-example';
import { FilterBarOverviewExample } from './filter-bar-overview/filter-bar-overview-example';
import { FilterBarRemovableExample } from './filter-bar-removable/filter-bar-removable-example';
import { FilterBarRequiredExample } from './filter-bar-required/filter-bar-required-example';

export {
    FilterBarCleanableExample,
    FilterBarCompleteFunctionsExample,
    FilterBarEmptyRemovableExample,
    FilterBarOperatingModesExample,
    FilterBarOverviewExample,
    FilterBarRemovableExample,
    FilterBarRequiredExample
};

const EXAMPLES = [
    FilterBarOverviewExample,
    FilterBarOperatingModesExample,
    FilterBarRemovableExample,
    FilterBarCleanableExample,
    FilterBarRequiredExample,
    FilterBarEmptyRemovableExample,
    FilterBarCompleteFunctionsExample
];

@NgModule({
    imports: EXAMPLES,
    exports: EXAMPLES
})
export class FilterBarExamplesModule {}
