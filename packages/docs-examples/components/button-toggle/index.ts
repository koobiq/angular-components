import { NgModule } from '@angular/core';
import { ButtonToggleAlignmentOverviewExample } from './button-toggle-alignment-overview/button-toggle-alignment-overview-example';
import { ButtonToggleDisabledAllOverviewExample } from './button-toggle-disabled-all-overview/button-toggle-disabled-all-overview-example';
import { ButtonToggleDisabledPartialOverviewExample } from './button-toggle-disabled-partial-overview/button-toggle-disabled-partial-overview-example';
import { ButtonToggleOverviewExample } from './button-toggle-overview/button-toggle-overview-example';
import { ButtonToggleTooltipOverviewExample } from './button-toggle-tooltip-overview/button-toggle-tooltip-overview-example';

export {
    ButtonToggleAlignmentOverviewExample,
    ButtonToggleDisabledAllOverviewExample,
    ButtonToggleDisabledPartialOverviewExample,
    ButtonToggleOverviewExample,
    ButtonToggleTooltipOverviewExample
};

const EXAMPLES = [
    ButtonToggleOverviewExample,
    ButtonToggleTooltipOverviewExample,
    ButtonToggleAlignmentOverviewExample,
    ButtonToggleDisabledAllOverviewExample,
    ButtonToggleDisabledPartialOverviewExample
];

@NgModule({
    imports: EXAMPLES,
    exports: EXAMPLES
})
export class ButtonToggleExamplesModule {}
