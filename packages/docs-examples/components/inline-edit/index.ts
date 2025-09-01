import { NgModule } from '@angular/core';
import { InlineEditDisabledExample } from './inline-edit-disabled/inline-edit-disabled-example';
import { InlineEditHorizontalListExample } from './inline-edit-horizontal-list/inline-edit-horizontal-list-example';
import { InlineEditMenuExample } from './inline-edit-menu/inline-edit-menu-example';
import { InlineEditOnCleanExample } from './inline-edit-on-clean/inline-edit-on-clean-example';
import { InlineEditOverviewExample } from './inline-edit-overview/inline-edit-overview-example';
import { InlineEditPlaceholderExample } from './inline-edit-placeholder/inline-edit-placeholder-example';
import { InlineEditValidationExample } from './inline-edit-validation/inline-edit-validation-example';

export {
    InlineEditDisabledExample,
    InlineEditHorizontalListExample,
    InlineEditMenuExample,
    InlineEditOnCleanExample,
    InlineEditOverviewExample,
    InlineEditPlaceholderExample,
    InlineEditValidationExample
};

const EXAMPLES = [
    InlineEditOverviewExample,
    InlineEditPlaceholderExample,
    InlineEditMenuExample,
    InlineEditDisabledExample,
    InlineEditHorizontalListExample,
    InlineEditOnCleanExample,
    InlineEditValidationExample
];

@NgModule({
    imports: EXAMPLES,
    exports: EXAMPLES
})
export class InlineEditExamplesModule {}
