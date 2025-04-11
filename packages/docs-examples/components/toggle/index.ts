import { NgModule } from '@angular/core';
import { ToggleIndeterminateExample } from './toggle-indeterminate/toggle-indeterminate-example';
import { ToggleMultilineExample } from './toggle-multiline/toggle-multiline-example';
import { ToggleOverviewExample } from './toggle-overview/toggle-overview-example';

export { ToggleMultilineExample, ToggleOverviewExample };

const EXAMPLES = [
    ToggleOverviewExample,
    ToggleMultilineExample,
    ToggleIndeterminateExample
];

@NgModule({
    imports: EXAMPLES,
    exports: EXAMPLES
})
export class ToggleExamplesModule {}
