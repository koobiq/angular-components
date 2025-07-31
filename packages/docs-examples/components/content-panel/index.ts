import { NgModule } from '@angular/core';
import { ContentPanelOverviewExample } from './content-panel-overview/content-panel-overview-example';
import { ContentPanelWithGridExample } from './content-panel-with-grid/content-panel-with-grid-example';

export { ContentPanelOverviewExample, ContentPanelWithGridExample };

const EXAMPLES = [
    ContentPanelWithGridExample,
    ContentPanelOverviewExample
];

@NgModule({
    imports: EXAMPLES,
    exports: EXAMPLES
})
export class ContentPanelExamplesModule {}
