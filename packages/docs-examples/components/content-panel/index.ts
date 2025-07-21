import { NgModule } from '@angular/core';
import { ContentPanelOverviewExample } from './content-panel-overview/content-panel-overview-example';

export { ContentPanelOverviewExample };

const EXAMPLES = [
    ContentPanelOverviewExample
];

@NgModule({
    imports: EXAMPLES,
    exports: EXAMPLES
})
export class ContentPanelExamplesModule {}
