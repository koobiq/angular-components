import { NgModule } from '@angular/core';
import { InlineEditDisabledExample } from './inline-edit-disabled/inline-edit-disabled-example';
import { InlineEditMenuExample } from './inline-edit-menu/inline-edit-menu-example';
import { InlineEditOverviewExample } from './inline-edit-overview/inline-edit-overview-example';
import { InlineEditPlaceholderExample } from './inline-edit-placeholder/inline-edit-placeholder-example';

export { InlineEditDisabledExample, InlineEditMenuExample, InlineEditOverviewExample, InlineEditPlaceholderExample };

const EXAMPLES = [
    InlineEditOverviewExample,
    InlineEditPlaceholderExample,
    InlineEditMenuExample,
    InlineEditDisabledExample
];

@NgModule({
    imports: EXAMPLES,
    exports: EXAMPLES
})
export class InlineEditExamplesModule {}
