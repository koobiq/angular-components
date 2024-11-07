import { NgModule } from '@angular/core';
import { ToggleOverviewExample } from './toggle-overview/toggle-overview-example';

export { ToggleOverviewExample };

const EXAMPLES = [
    ToggleOverviewExample
];

@NgModule({
    imports: EXAMPLES,
    exports: EXAMPLES
})
export class ToggleExamplesModule {}
