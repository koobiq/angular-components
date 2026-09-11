import { NgModule } from '@angular/core';
import { ContentPanelOverviewExample } from './content-panel-overview/content-panel-overview-example';
import { ContentPanelStateSavingExample } from './content-panel-state-saving/content-panel-state-saving-example';
import { ContentPanelWithGridExample } from './content-panel-with-grid/content-panel-with-grid-example';

export { ContentPanelOverviewExample, ContentPanelStateSavingExample, ContentPanelWithGridExample };

const EXAMPLES = [
    ContentPanelWithGridExample,
    ContentPanelOverviewExample,
    ContentPanelStateSavingExample
];

@NgModule({
    imports: EXAMPLES,
    exports: EXAMPLES
})
export class ContentPanelExamplesModule {}
