import { NgModule } from '@angular/core';
import { InlineEditControlsExample } from './inline-edit-controls/inline-edit-controls-example';
import { InlineEditCustomHandlerExample } from './inline-edit-custom-handler/inline-edit-custom-handler-example';
import { InlineEditDisabledExample } from './inline-edit-disabled/inline-edit-disabled-example';
import { InlineEditEditableHeaderExample } from './inline-edit-editable-header/inline-edit-editable-header-example';
import { InlineEditHorizontalListExample } from './inline-edit-horizontal-list/inline-edit-horizontal-list-example';
import { InlineEditMenuExample } from './inline-edit-menu/inline-edit-menu-example';
import { InlineEditOnCleanExample } from './inline-edit-on-clean/inline-edit-on-clean-example';
import { InlineEditOverviewExample } from './inline-edit-overview/inline-edit-overview-example';
import { InlineEditUnfilledExample } from './inline-edit-unfilled/inline-edit-unfilled-example';
import { InlineEditValidationExample } from './inline-edit-validation/inline-edit-validation-example';
import { InlineEditVerticalListExample } from './inline-edit-vertical-list/inline-edit-vertical-list-example';
import { InlineEditWithoutLabelExample } from './inline-edit-without-label/inline-edit-without-label-example';

export {
    InlineEditControlsExample,
    InlineEditCustomHandlerExample,
    InlineEditDisabledExample,
    InlineEditEditableHeaderExample,
    InlineEditHorizontalListExample,
    InlineEditMenuExample,
    InlineEditOnCleanExample,
    InlineEditOverviewExample,
    InlineEditUnfilledExample,
    InlineEditValidationExample,
    InlineEditVerticalListExample,
    InlineEditWithoutLabelExample
};

const EXAMPLES = [
    InlineEditOverviewExample,
    InlineEditUnfilledExample,
    InlineEditMenuExample,
    InlineEditDisabledExample,
    InlineEditHorizontalListExample,
    InlineEditOnCleanExample,
    InlineEditValidationExample,
    InlineEditCustomHandlerExample,
    InlineEditVerticalListExample,
    InlineEditWithoutLabelExample,
    InlineEditControlsExample,
    InlineEditEditableHeaderExample
];

@NgModule({
    imports: EXAMPLES,
    exports: EXAMPLES
})
export class InlineEditExamplesModule {}
