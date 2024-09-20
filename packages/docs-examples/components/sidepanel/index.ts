import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { KbqButtonModule } from '@koobiq/components/button';
import { KbqFormFieldModule } from '@koobiq/components/form-field';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqSelectModule } from '@koobiq/components/select';
import { KbqSidepanelModule } from '@koobiq/components/sidepanel';
import { KbqToggleModule } from '@koobiq/components/toggle';
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
    imports: [
        KbqButtonModule,
        KbqIconModule,
        KbqSidepanelModule,
        KbqFormFieldModule,
        KbqSelectModule,
        KbqToggleModule,
        FormsModule
    ],
    declarations: EXAMPLES,
    exports: EXAMPLES
})
export class SidepanelExamplesModule {}
