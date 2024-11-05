import { NgModule } from '@angular/core';
import { SidepanelModalModeExample } from './sidepanel-modal-mode/sidepanel-modal-mode-example';
import { SidepanelNormalModeExample } from './sidepanel-normal-mode/sidepanel-normal-mode-example';
import { SidepanelOverlayedExample } from './sidepanel-overlayed/sidepanel-overlayed-example';
import { SidepanelSizesExample } from './sidepanel-sizes/sidepanel-sizes-example';

export { SidepanelModalModeExample, SidepanelNormalModeExample, SidepanelOverlayedExample, SidepanelSizesExample };

const EXAMPLES = [
    SidepanelModalModeExample,
    SidepanelNormalModeExample,
    SidepanelOverlayedExample,
    SidepanelSizesExample
];

@NgModule({
    imports: EXAMPLES,
    exports: EXAMPLES
})
export class SidepanelExamplesModule {}
