import { NgModule } from '@angular/core';
import { InlineEditOverviewExample } from './inline-edit-overview/inline-edit-overview-example';

export { InlineEditOverviewExample };

const EXAMPLES = [InlineEditOverviewExample];

@NgModule({
    imports: EXAMPLES,
    exports: EXAMPLES
})
export class InlineEditExamplesModule {}
