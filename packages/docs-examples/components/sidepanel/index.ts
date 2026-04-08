import { NgModule } from '@angular/core';
import { SidepanelNormalModeExample } from './sidepanel-normal-mode/sidepanel-normal-mode-example';
import { SidepanelOverlayedExample } from './sidepanel-overlayed/sidepanel-overlayed-example';
import { SidepanelOverviewExample } from './sidepanel-overview/sidepanel-overview-example';
import { SidepanelSizesExample } from './sidepanel-sizes/sidepanel-sizes-example';
import { SidepanelWithCustomInjectorExample } from './sidepanel-with-custom-injector/sidepanel-with-custom-injector-example';
import { SidepanelWithDynamicConfigUpdateExample } from './sidepanel-with-dynamic-config-update/sidepanel-with-dynamic-config-update-example';

export {
    SidepanelNormalModeExample,
    SidepanelOverlayedExample,
    SidepanelOverviewExample,
    SidepanelSizesExample,
    SidepanelWithCustomInjectorExample,
    SidepanelWithDynamicConfigUpdateExample
};

const EXAMPLES = [
    SidepanelOverviewExample,
    SidepanelNormalModeExample,
    SidepanelOverlayedExample,
    SidepanelSizesExample,
    SidepanelWithCustomInjectorExample,
    SidepanelWithDynamicConfigUpdateExample
];

@NgModule({
    imports: EXAMPLES,
    exports: EXAMPLES
})
export class SidepanelExamplesModule {}
