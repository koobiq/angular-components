import { NgModule } from '@angular/core';
import { SidepanelModalModeExample } from './sidepanel-modal-mode/sidepanel-modal-mode-example';
import { SidepanelNormalModeExample } from './sidepanel-normal-mode/sidepanel-normal-mode-example';
import { SidepanelOverlayedExample } from './sidepanel-overlayed/sidepanel-overlayed-example';
import { SidepanelSizesExample } from './sidepanel-sizes/sidepanel-sizes-example';
import { SidepanelWithDynamicConfigUpdateExample } from './sidepanel-with-dynamic-config-update/sidepanel-with-dynamic-config-update-example';

export {
    SidepanelModalModeExample,
    SidepanelNormalModeExample,
    SidepanelOverlayedExample,
    SidepanelSizesExample,
    SidepanelWithDynamicConfigUpdateExample
};

const EXAMPLES = [
    SidepanelModalModeExample,
    SidepanelNormalModeExample,
    SidepanelOverlayedExample,
    SidepanelSizesExample,
    SidepanelWithDynamicConfigUpdateExample
];

@NgModule({
    imports: EXAMPLES,
    exports: EXAMPLES
})
export class SidepanelExamplesModule {}
