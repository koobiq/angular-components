import { NgModule } from '@angular/core';
import { ToggleIndeterminateExample } from './toggle-indeterminate/toggle-indeterminate-example';
import { ToggleLoadingExample } from './toggle-loading/toggle-loading-example';
import { ToggleMultilineExample } from './toggle-multiline/toggle-multiline-example';
import { ToggleOverviewExample } from './toggle-overview/toggle-overview-example';

export { ToggleIndeterminateExample, ToggleLoadingExample, ToggleMultilineExample, ToggleOverviewExample };

const EXAMPLES = [
    ToggleOverviewExample,
    ToggleMultilineExample,
    ToggleIndeterminateExample,
    ToggleLoadingExample
];

@NgModule({
    imports: EXAMPLES,
    exports: EXAMPLES
})
export class ToggleExamplesModule {}
