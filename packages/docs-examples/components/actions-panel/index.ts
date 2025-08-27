import { NgModule } from '@angular/core';
import { ActionsPanelAdaptiveExample } from './actions-panel-adaptive/actions-panel-adaptive-example';
import { ActionsPanelCloseExample } from './actions-panel-close/actions-panel-close-example';
import { ActionsPanelCustomCounterExample } from './actions-panel-custom-counter/actions-panel-custom-counter-example';
import { ActionsPanelOverviewExample } from './actions-panel-overview/actions-panel-overview-example';
import { ActionsPanelWithDropdownAndPopoverExample } from './actions-panel-with-dropdown-and-popover/actions-panel-with-dropdown-and-popover-example';

export {
    ActionsPanelAdaptiveExample,
    ActionsPanelCloseExample,
    ActionsPanelCustomCounterExample,
    ActionsPanelOverviewExample,
    ActionsPanelWithDropdownAndPopoverExample
};

const EXAMPLES = [
    ActionsPanelAdaptiveExample,
    ActionsPanelCloseExample,
    ActionsPanelCustomCounterExample,
    ActionsPanelOverviewExample,
    ActionsPanelWithDropdownAndPopoverExample
];

@NgModule({
    imports: EXAMPLES,
    exports: EXAMPLES
})
export class ActionsPanelExamplesModule {}
