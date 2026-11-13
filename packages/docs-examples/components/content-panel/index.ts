import { NgModule } from '@angular/core';
import { ContentPanelBeforeCloseExample } from './content-panel-before-close/content-panel-before-close-example';
import { ContentPanelCloseOnEscapeExample } from './content-panel-close-on-escape/content-panel-close-on-escape-example';
import { ContentPanelOverviewExample } from './content-panel-overview/content-panel-overview-example';
import { ContentPanelStateSavingExample } from './content-panel-state-saving/content-panel-state-saving-example';

export {
    ContentPanelBeforeCloseExample,
    ContentPanelCloseOnEscapeExample,
    ContentPanelOverviewExample,
    ContentPanelStateSavingExample
};

const EXAMPLES = [
    ContentPanelBeforeCloseExample,
    ContentPanelCloseOnEscapeExample,
    ContentPanelOverviewExample,
    ContentPanelStateSavingExample
];

@NgModule({
    imports: EXAMPLES,
    exports: EXAMPLES
})
export class ContentPanelExamplesModule {}
