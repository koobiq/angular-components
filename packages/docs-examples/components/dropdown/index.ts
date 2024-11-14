import { NgModule } from '@angular/core';
import { DropdownDisabledExample } from './dropdown-disabled/dropdown-disabled-example';
import { DropdownLazyloadDataExample } from './dropdown-lazyload-data/dropdown-lazyload-data-example';
import { DropdownNavigationWrapExample } from './dropdown-navigation-wrap/dropdown-navigation-wrap-example';
import { DropdownNestedExample } from './dropdown-nested/dropdown-nested-example';
import { DropdownOpenByArrowDownExample } from './dropdown-open-by-arrowdown/dropdown-open-by-arrow-down-example';
import { DropdownOverviewExample } from './dropdown-overview/dropdown-overview-example';

export {
    DropdownDisabledExample,
    DropdownLazyloadDataExample,
    DropdownNavigationWrapExample,
    DropdownNestedExample,
    DropdownOpenByArrowDownExample,
    DropdownOverviewExample
};

const EXAMPLES = [
    DropdownNestedExample,
    DropdownOverviewExample,
    DropdownNavigationWrapExample,
    DropdownDisabledExample,
    DropdownLazyloadDataExample,
    DropdownOpenByArrowDownExample
];

@NgModule({
    imports: EXAMPLES,
    exports: EXAMPLES
})
export class DropdownExamplesModule {}
