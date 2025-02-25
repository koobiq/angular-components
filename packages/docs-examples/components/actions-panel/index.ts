import { NgModule } from '@angular/core';
import { ActionsPanelAdaptiveExample } from './actions-panel-adaptive/actions-panel-adaptive-example';
import { ActionsPanelOverviewExample } from './actions-panel-overview/actions-panel-overview-example';

export { ActionsPanelAdaptiveExample, ActionsPanelOverviewExample };

const EXAMPLES = [
    ActionsPanelOverviewExample,
    ActionsPanelAdaptiveExample
];

@NgModule({
    imports: EXAMPLES,
    exports: EXAMPLES
})
export class ActionsPanelExamplesModule {}
