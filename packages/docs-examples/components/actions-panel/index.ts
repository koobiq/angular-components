import { NgModule } from '@angular/core';
import { ActionsPanelAdaptiveExample } from './actions-panel-adaptive/actions-panel-adaptive-example';
import { ActionsPanelCustomCounterExample } from './actions-panel-custom-counter/actions-panel-custom-counter-example';
import { ActionsPanelOverviewExample } from './actions-panel-overview/actions-panel-overview-example';

export { ActionsPanelAdaptiveExample, ActionsPanelCustomCounterExample, ActionsPanelOverviewExample };

const EXAMPLES = [
    ActionsPanelAdaptiveExample,
    ActionsPanelCustomCounterExample,
    ActionsPanelOverviewExample
];

@NgModule({
    imports: EXAMPLES,
    exports: EXAMPLES
})
export class ActionsPanelExamplesModule {}
