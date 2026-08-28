import { NgModule } from '@angular/core';
import { DropdownDisabledExample } from './dropdown-disabled/dropdown-disabled-example';
import { DropdownItemActionExample } from './dropdown-item-action/dropdown-item-action-example';
import { DropdownItemLinkExample } from './dropdown-item-link/dropdown-item-link-example';
import { DropdownItemProgressExample } from './dropdown-item-progress/dropdown-item-progress-example';
import { DropdownLazyloadDataExample } from './dropdown-lazyload-data/dropdown-lazyload-data-example';
import { DropdownNavigationWrapExample } from './dropdown-navigation-wrap/dropdown-navigation-wrap-example';
import { DropdownNestedExample } from './dropdown-nested/dropdown-nested-example';
import { DropdownOpenByArrowDownExample } from './dropdown-open-by-arrow-down/dropdown-open-by-arrow-down-example';
import { DropdownOverviewExample } from './dropdown-overview/dropdown-overview-example';
import { DropdownRecursiveTemplateExample } from './dropdown-recursive-template/dropdown-recursive-template-example';
import { DropdownSafeAreaExample } from './dropdown-safe-area/dropdown-safe-area-example';
import { DropdownWithFilterExample } from './dropdown-with-filter/dropdown-with-filter-example';
import { DropdownWithFooterExample } from './dropdown-with-footer/dropdown-with-footer-example';
import { DropdownXPositionExample } from './dropdown-x-position/dropdown-x-position-example';

export {
    DropdownDisabledExample,
    DropdownItemActionExample,
    DropdownItemLinkExample,
    DropdownItemProgressExample,
    DropdownLazyloadDataExample,
    DropdownNavigationWrapExample,
    DropdownNestedExample,
    DropdownOpenByArrowDownExample,
    DropdownOverviewExample,
    DropdownRecursiveTemplateExample,
    DropdownSafeAreaExample,
    DropdownWithFilterExample,
    DropdownWithFooterExample,
    DropdownXPositionExample
};

const EXAMPLES = [
    DropdownNestedExample,
    DropdownOverviewExample,
    DropdownWithFooterExample,
    DropdownNavigationWrapExample,
    DropdownDisabledExample,
    DropdownItemActionExample,
    DropdownItemLinkExample,
    DropdownItemProgressExample,
    DropdownLazyloadDataExample,
    DropdownOpenByArrowDownExample,
    DropdownRecursiveTemplateExample,
    DropdownSafeAreaExample,
    DropdownWithFilterExample,
    DropdownXPositionExample
];

@NgModule({
    imports: EXAMPLES,
    exports: EXAMPLES
})
export class DropdownExamplesModule {}
