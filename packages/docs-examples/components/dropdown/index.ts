import { NgModule } from '@angular/core';
import { DropdownNavigationWrapExample } from './dropdown-navigation-wrap/dropdown-navigation-wrap-example';
import { DropdownNestedExample } from './dropdown-nested/dropdown-nested-example';
import { DropdownOverviewExample } from './dropdown-overview/dropdown-overview-example';

export { DropdownNavigationWrapExample, DropdownNestedExample, DropdownOverviewExample };

const EXAMPLES = [
    DropdownNestedExample,
    DropdownOverviewExample,
    DropdownNavigationWrapExample
];

@NgModule({
    imports: EXAMPLES,
    exports: EXAMPLES
})
export class DropdownExamplesModule {}
