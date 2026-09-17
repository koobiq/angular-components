import { NgModule } from '@angular/core';
import { ContentPanelOverviewExample } from './content-panel-overview/content-panel-overview-example';
import { ContentPanelStateSavingExample } from './content-panel-state-saving/content-panel-state-saving-example';

export { ContentPanelOverviewExample, ContentPanelStateSavingExample };

const EXAMPLES = [
    ContentPanelOverviewExample,
    ContentPanelStateSavingExample
];

@NgModule({
    imports: EXAMPLES,
    exports: EXAMPLES
})
export class ContentPanelExamplesModule {}
