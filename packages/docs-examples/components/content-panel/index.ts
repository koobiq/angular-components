import { NgModule } from '@angular/core';
import { ContentPanelOverviewExample } from './content-panel-overview/content-panel-overview-example';
import { ContentPanelScrollEventsExample } from './content-panel-scroll-events/content-panel-scroll-events-example';
import { ContentPanelWithGridExample } from './content-panel-with-grid/content-panel-with-grid-example';

export { ContentPanelOverviewExample, ContentPanelScrollEventsExample, ContentPanelWithGridExample };

const EXAMPLES = [
    ContentPanelWithGridExample,
    ContentPanelScrollEventsExample,
    ContentPanelOverviewExample
];

@NgModule({
    imports: EXAMPLES,
    exports: EXAMPLES
})
export class ContentPanelExamplesModule {}
