import { NgModule } from '@angular/core';
import { ActionsPanelOverviewExample } from './actions-panel-overview/actions-panel-overview-example';

export { ActionsPanelOverviewExample };

const EXAMPLES = [
    ActionsPanelOverviewExample
];

@NgModule({
    imports: EXAMPLES,
    exports: EXAMPLES
})
export class ActionsPanelExamplesModule {}
