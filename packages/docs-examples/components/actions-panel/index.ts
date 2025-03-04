import { NgModule } from '@angular/core';
import { ActionsPanelAdaptiveExample } from './actions-panel-adaptive/actions-panel-adaptive-example';
import { ActionsPanelCloseExample } from './actions-panel-close/actions-panel-close-example';
import { ActionsPanelCustomCounterExample } from './actions-panel-custom-counter/actions-panel-custom-counter-example';
import { ActionsPanelOverviewExample } from './actions-panel-overview/actions-panel-overview-example';

export {
    ActionsPanelAdaptiveExample,
    ActionsPanelCloseExample,
    ActionsPanelCustomCounterExample,
    ActionsPanelOverviewExample
};

const EXAMPLES = [
    ActionsPanelAdaptiveExample,
    ActionsPanelCloseExample,
    ActionsPanelCustomCounterExample,
    ActionsPanelOverviewExample
];

@NgModule({
    imports: EXAMPLES,
    exports: EXAMPLES
})
export class ActionsPanelExamplesModule {}
