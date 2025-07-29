import { NgModule } from '@angular/core';
import { ContentPanelOverviewExample } from './content-panel-overview/content-panel-overview-example';
import { ContentPanelScrollEventsExample } from './content-panel-scroll-events/content-panel-scroll-events-example';

export { ContentPanelOverviewExample, ContentPanelScrollEventsExample };

const EXAMPLES = [
    ContentPanelOverviewExample,
    ContentPanelScrollEventsExample
];

@NgModule({
    imports: EXAMPLES,
    exports: EXAMPLES
})
export class ContentPanelExamplesModule {}
