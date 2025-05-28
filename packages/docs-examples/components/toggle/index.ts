import { NgModule } from '@angular/core';
import { ToggleDisabledExample } from './toggle-disabled/toggle-disabled-example';
import { ToggleErrorExample } from './toggle-error/toggle-error-example';
import { ToggleIndeterminateExample } from './toggle-indeterminate/toggle-indeterminate-example';
import { ToggleLabelLeftExample } from './toggle-label-left/toggle-label-left-example';
import { ToggleLoadingExample } from './toggle-loading/toggle-loading-example';
import { ToggleMultilineExample } from './toggle-multiline/toggle-multiline-example';
import { ToggleOverviewExample } from './toggle-overview/toggle-overview-example';
import { ToggleWithHintExample } from './toggle-with-hint/toggle-with-hint-example';

export {
    ToggleDisabledExample,
    ToggleErrorExample,
    ToggleIndeterminateExample,
    ToggleLabelLeftExample,
    ToggleLoadingExample,
    ToggleMultilineExample,
    ToggleOverviewExample,
    ToggleWithHintExample
};

const EXAMPLES = [
    ToggleOverviewExample,
    ToggleMultilineExample,
    ToggleIndeterminateExample,
    ToggleLoadingExample,
    ToggleDisabledExample,
    ToggleErrorExample,
    ToggleLabelLeftExample,
    ToggleWithHintExample
];

@NgModule({
    imports: EXAMPLES,
    exports: EXAMPLES
})
export class ToggleExamplesModule {}
