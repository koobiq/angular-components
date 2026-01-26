import { NgModule } from '@angular/core';
import { DropdownDisabledExample } from './dropdown-disabled/dropdown-disabled-example';
import { DropdownLazyloadDataExample } from './dropdown-lazyload-data/dropdown-lazyload-data-example';
import { DropdownNavigationWrapExample } from './dropdown-navigation-wrap/dropdown-navigation-wrap-example';
import { DropdownNestedExample } from './dropdown-nested/dropdown-nested-example';
import { DropdownOpenByArrowDownExample } from './dropdown-open-by-arrow-down/dropdown-open-by-arrow-down-example';
import { DropdownOverviewExample } from './dropdown-overview/dropdown-overview-example';
import { DropdownRecursiveTemplateExample } from './dropdown-recursive-template/dropdown-recursive-template-example';
import { DropdownWithFilterExample } from './dropdown-with-filter/dropdown-with-filter-example';

export {
    DropdownDisabledExample,
    DropdownLazyloadDataExample,
    DropdownNavigationWrapExample,
    DropdownNestedExample,
    DropdownOpenByArrowDownExample,
    DropdownOverviewExample,
    DropdownRecursiveTemplateExample,
    DropdownWithFilterExample
};

const EXAMPLES = [
    DropdownNestedExample,
    DropdownOverviewExample,
    DropdownNavigationWrapExample,
    DropdownDisabledExample,
    DropdownLazyloadDataExample,
    DropdownOpenByArrowDownExample,
    DropdownRecursiveTemplateExample,
    DropdownWithFilterExample
];

@NgModule({
    imports: EXAMPLES,
    exports: EXAMPLES
})
export class DropdownExamplesModule {}
