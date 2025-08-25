import { NgModule } from '@angular/core';
import { InlineEditOverviewExample } from './inline-edit-overview/inline-edit-overview-example';
import { InlineEditPlaceholderExample } from './inline-edit-placeholder/inline-edit-placeholder-example';

export { InlineEditOverviewExample, InlineEditPlaceholderExample };

const EXAMPLES = [InlineEditOverviewExample, InlineEditPlaceholderExample];

@NgModule({
    imports: EXAMPLES,
    exports: EXAMPLES
})
export class InlineEditExamplesModule {}
