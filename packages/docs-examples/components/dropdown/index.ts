import { NgModule } from '@angular/core';
import { DropdownDisabledExample } from './dropdown-disabled/dropdown-disabled-example';
import { DropdownItemProgressExample } from './dropdown-item-progress/dropdown-item-progress-example';
import { DropdownLazyloadDataExample } from './dropdown-lazyload-data/dropdown-lazyload-data-example';
import { DropdownNavigationWrapExample } from './dropdown-navigation-wrap/dropdown-navigation-wrap-example';
import { DropdownNestedExample } from './dropdown-nested/dropdown-nested-example';
import { DropdownOpenByArrowDownExample } from './dropdown-open-by-arrow-down/dropdown-open-by-arrow-down-example';
import { DropdownOverviewExample } from './dropdown-overview/dropdown-overview-example';
import { DropdownRecursiveTemplateExample } from './dropdown-recursive-template/dropdown-recursive-template-example';
import { DropdownWithFilterExample } from './dropdown-with-filter/dropdown-with-filter-example';
import { DropdownXPositionExample } from './dropdown-x-position/dropdown-x-position-example';

export {
    DropdownDisabledExample,
    DropdownItemProgressExample,
    DropdownLazyloadDataExample,
    DropdownNavigationWrapExample,
    DropdownNestedExample,
    DropdownOpenByArrowDownExample,
    DropdownOverviewExample,
    DropdownRecursiveTemplateExample,
    DropdownWithFilterExample,
    DropdownXPositionExample
};

const EXAMPLES = [
    DropdownNestedExample,
    DropdownOverviewExample,
    DropdownNavigationWrapExample,
    DropdownDisabledExample,
    DropdownItemProgressExample,
    DropdownLazyloadDataExample,
    DropdownOpenByArrowDownExample,
    DropdownRecursiveTemplateExample,
    DropdownWithFilterExample,
    DropdownXPositionExample
];

@NgModule({
    imports: EXAMPLES,
    exports: EXAMPLES
})
export class DropdownExamplesModule {}
