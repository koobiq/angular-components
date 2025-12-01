import { NgModule } from '@angular/core';
import { ResizerOverviewExample } from './resizer-overview/resizer-overview-example';

export { ResizerOverviewExample };

const EXAMPLES = [ResizerOverviewExample];

@NgModule({
    imports: EXAMPLES,
    exports: EXAMPLES
})
export class ResizerExamplesModule {}
