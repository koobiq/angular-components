import { NgModule } from '@angular/core';
import { ToggleIndeterminateExample } from './toggle-indeterminate/toggle-indeterminate-example';
import { ToggleOverviewExample } from './toggle-overview/toggle-overview-example';

export { ToggleOverviewExample };

const EXAMPLES = [
    ToggleOverviewExample,
    ToggleIndeterminateExample
];

@NgModule({
    imports: EXAMPLES,
    exports: EXAMPLES
})
export class ToggleExamplesModule {}
