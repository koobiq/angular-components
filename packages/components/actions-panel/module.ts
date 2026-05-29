import { NgModule } from '@angular/core';
import { KbqActionsPanel } from './actions-panel';
import { KbqActionsPanelContainer } from './actions-panel-container';

const COMPONENTS = [
    KbqActionsPanelContainer
];

@NgModule({
    imports: COMPONENTS,
    providers: [KbqActionsPanel],
    exports: COMPONENTS
})
export class KbqActionsPanelModule {}
